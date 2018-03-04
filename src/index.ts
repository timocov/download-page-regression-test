#!/usr/bin/env node

import * as puppeteer from 'puppeteer';

import { getRequests } from './get-requests-until-load';
import { getAverageLoadingTimes } from './get-loading-times';

import { CheckerData, CheckerFunction } from './checkers/checker';

import {
	checkDomContentLoadedTime,
	checkEntryHtmlSize,
	checkHavingRedirect,
	checkLoadTime,
	checkRequestsCount,
	checkTotalLoadedSize,
} from './checkers/primitive-checkers';

const checkers: CheckerFunction[] = [
	checkDomContentLoadedTime,
	checkLoadTime,
	checkHavingRedirect,
	checkRequestsCount,
	checkEntryHtmlSize,
	checkTotalLoadedSize,
];

async function collectForUrl(browser: puppeteer.Browser, url: string): Promise<CheckerData> {
	const requestsResult = await getRequests(browser, url);
	return {
		loadingTimes: await getAverageLoadingTimes(browser, url),
		requests: requestsResult.requests,
		requestedUrl: url,
		openedUrl: requestsResult.openedUrl,
	};
}

async function main(): Promise<void> {
	const browser = await puppeteer.launch();

	const urls = process.argv.slice(2);

	let isSuccess = true;
	for (const url of urls) {
		console.log(url);

		let data: CheckerData;

		try {
			data = await collectForUrl(browser, url);
		} catch (e) {
			console.error(`Cannot get data for url ${url}: ${e.toString()}`);
			isSuccess = false;
			continue;
		}

		for (const checker of checkers) {
			const res = checker(data);
			const prefix = res.success ? '+' : '-';
			const suffix = res.success ? '' : ` (${res.additionalText})`;
			console.log(` ${prefix} ${res.text}${suffix}`);

			isSuccess = isSuccess && res.success;
		}

		console.log('');
	}

	browser.close();

	if (!isSuccess) {
		process.exit(1);
	}
}

main();
