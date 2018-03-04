import * as puppeteer from 'puppeteer';

import { getRequests } from './get-requests-until-load';
import { getAverageLoadingTimes } from './get-loading-times';

import {
	CheckerData,
	CheckerResult,
	isCheckerParameterless,
	ParameterizedChecker,
} from './checkers/checker';

import { checkers } from './checkers/primitive-checkers';

export interface CheckerConfig {
	enabled?: boolean;

	// tslint:disable-next-line:no-any
	value?: any;
}

export interface UrlConfig {
	rules?: Record<string, CheckerConfig>;
}

export interface UrlsConfig {
	[url: string]: UrlConfig;
}

const allCheckers = [
	...checkers,
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

// tslint:disable-next-line:cyclomatic-complexity
export async function runForUrls(config: UrlsConfig): Promise<boolean> {
	const browser = await puppeteer.launch();

	let isSuccess = true;

	function handleError(message: string): void {
		console.error(message);
		isSuccess = false;
	}

	for (const url of Object.keys(config)) {
		console.log(url);

		let data: CheckerData;

		try {
			data = await collectForUrl(browser, url);
		} catch (e) {
			handleError(`Cannot get data for url ${url}: ${e.toString()}`);
			continue;
		}

		const urlConfig = config[url];

		for (const checker of allCheckers) {
			const checkerConfig = urlConfig.rules && urlConfig.rules[checker.name];
			if (checkerConfig !== undefined && checkerConfig.enabled === false) {
				continue;
			}

			let res: CheckerResult;

			if (isCheckerParameterless(checker)) {
				res = checker.check(data);
			} else {
				const param: typeof checker.defValue = checkerConfig !== undefined && checkerConfig.value !== undefined ? checkerConfig.value : checker.defValue;
				if (typeof param !== typeof checker.defValue) {
					handleError(`Wrong type for checker ${checker.name} in ${url}: expected=${typeof checker.defValue}, actual=${typeof param}`);
					continue;
				}

				// we already know that type of defValue and parameter of check function are the same
				// but this hack is here to prevent TypeScript errors about incompatible call signature
				res = (checker as ParameterizedChecker<typeof param>).check(data, param);
			}

			const prefix = res.success ? '+' : '-';
			const suffix = res.success ? '' : ` (${res.additionalText})`;
			console.log(` ${prefix} ${res.text}${suffix} [${checker.name}]`);

			isSuccess = isSuccess && res.success;
		}

		console.log('');
	}

	browser.close();

	return isSuccess;
}
