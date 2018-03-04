import * as puppeteer from 'puppeteer';

export interface LoadingTimes {
	domContentLoaded: number;
	load: number;
}

export interface RequestInfo {
	url: string;
	encodedDataLength: number;

	headers: puppeteer.Headers;
}

export interface CheckerResult {
	success: boolean;
	text: string;
	additionalText: string;
}

export interface CheckerData {
	loadingTimes: LoadingTimes;
	requests: RequestInfo[];
	requestedUrl: string;
	openedUrl: string;
}

export type CheckerFunction = (data: CheckerData) => CheckerResult;
