import * as puppeteer from 'puppeteer';

import { LoadingTimes } from './checkers/checker';

export async function getAverageLoadingTimes(browser: puppeteer.Browser, url: string, count: number = 3): Promise<LoadingTimes> {
	const result: LoadingTimes = {
		domContentLoaded: 0,
		load: 0,
	};

	for (let i = 0; i < count; ++i) {
		const page = await browser.newPage();

		// tslint:disable-next-line:no-any
		(page as any).setCacheEnabled(false);

		page.addListener('domcontentloaded', () => {
			result.domContentLoaded += Date.now() - startTime;
		});

		page.addListener('load', () => {
			result.load += Date.now() - startTime;
		});

		const startTime = Date.now();
		await page.goto(url);
		await page.close();
	}

	result.load /= count;
	result.domContentLoaded /= count;

	return result;
}
