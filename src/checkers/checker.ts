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

export interface ParameterizedChecker<T> {
	name: string;
	defValue: T;
	check(data: CheckerData, param: T): CheckerResult;
}

export interface ParameterlessChecker {
	name: string;
	check(data: CheckerData): CheckerResult;
}

// tslint:disable-next-line:no-any
export function isCheckerParameterless(checker: any): checker is ParameterlessChecker {
	return !('defValue' in checker);
}
