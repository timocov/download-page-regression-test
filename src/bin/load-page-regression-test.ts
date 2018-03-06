#!/usr/bin/env node

import * as fs from 'fs';

import { ArgumentParser } from 'argparse';

import { LaunchOptions } from 'puppeteer';

import { runForUrls, UrlsConfig } from '../index';

function parseConfig(configPath: string): UrlsConfig {
	const availableUrlKeys = ['rules'];
	const content = fs.readFileSync(configPath, { encoding: 'utf-8' });
	const config = JSON.parse(content);
	if (typeof config !== 'object' || Array.isArray(config)) {
		throw new Error(`Config must be object`);
	}

	for (const url of Object.keys(config)) {
		if (typeof config[url] !== 'object' || Array.isArray(config[url])) {
			throw new Error(`Config for ${url} must be object`);
		}

		for (const key of Object.keys(config[url])) {
			if (!availableUrlKeys.includes(key)) {
				throw new Error(`Config for ${url} contains unknown key "${key}"`);
			}
		}
	}

	return config;
}

function main(): void {
	const argsParser = new ArgumentParser();

	argsParser.addArgument(
		['--no-sandbox'],
		{
			dest: 'noSandbox',
			help: 'Disables Chrome sandbox',
			type: Boolean,
			action: 'storeTrue',
			defaultValue: false,
		}
	);

	argsParser.addArgument(
		['--config'],
		{
			type: 'string',
			defaultValue: '',
			help: 'Path to config file',
		}
	);

	argsParser.addArgument(
		['urls'],
		{
			nargs: '*',
			help: 'Urls to check',
		}
	);

	const args = argsParser.parseArgs();

	let urlsConfig: UrlsConfig;
	if (args.config.length !== 0) {
		if (args.urls.length !== 0) {
			throw new Error('URLs array cannot be used with --config');
		}

		urlsConfig = parseConfig(args.config);
	} else {
		if (args.urls.length === 0) {
			throw new Error('too few urls');
		}

		urlsConfig = {};
		for (const url of args.urls) {
			// assume that all rules enabled and has default parameters
			urlsConfig[url] = {};
		}
	}

	const options: LaunchOptions = {};
	if (args.noSandbox) {
		options.args = ['--no-sandbox', '--disable-setuid-sandbox'];
	}

	const runPromise = runForUrls(urlsConfig, options);
	runPromise.then((isSuccess: boolean) => {
		process.exit(isSuccess ? 0 : 1);
	});

	runPromise.catch((err: Error | string) => {
		console.error(err.toString());
		process.exit(1);
	});
}

main();
