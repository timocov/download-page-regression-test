import * as puppeteer from 'puppeteer';

import { RequestInfo } from './checkers/checker';

export interface GetRequestsResult {
	openedUrl: string;
	requests: RequestInfo[];
}

export async function getRequests(browser: puppeteer.Browser, url: string): Promise<GetRequestsResult> {
	const page = await browser.newPage();

	// tslint:disable-next-line:no-any
	(page as any).setCacheEnabled(false);

	const requests: RequestInfo[] = [];

	const requestInfoByRequestId: Record<string, RequestInfo | undefined> = {};

	// tslint:disable-next-line:no-any
	(page as any)._client.on('Network.loadingFinished', (event: any) => {
		const requestInfo = requestInfoByRequestId[event.requestId];
		if (requestInfo !== undefined) {
			requestInfo.encodedDataLength = event.encodedDataLength;
		}
	});

	page.addListener('response', (response: puppeteer.Response) => {
		if (!response.ok() || response.url().startsWith('data:')) {
			return;
		}

		const requestInfo: RequestInfo = {
			url: response.url(),
			encodedDataLength: 0,
			headers: response.headers(),
		};

		requests.push(requestInfo);

		// tslint:disable-next-line:no-any
		const reqId = (response.request() as any)._requestId;
		requestInfoByRequestId[reqId] = requestInfo;
	});

	const openedUrlRequest = await page.goto(url);
	await page.close();

	if (openedUrlRequest === null || !openedUrlRequest.ok()) {
		const errorReason = openedUrlRequest === null ? 'request is null' : `request status is ${openedUrlRequest.status()}`;
		throw new Error(`Cannot open page because ${errorReason}`);
	}

	return {
		openedUrl: openedUrlRequest.url(),
		requests: requests,
	};
}
