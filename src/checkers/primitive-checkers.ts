import { CheckerData, CheckerResult, RequestInfo } from './checker';

const enum Constants {
	MaxDOMContentLoadedTime = 3000,
	MaxLoadTime = 5000,
	MaxRequestsCount = 30,
	MaxEntryHtmlSize = 14336,
	MaxTotalLoadedSize = 1048576,
}

export function checkDomContentLoadedTime(data: CheckerData): CheckerResult {
	return {
		success: data.loadingTimes.domContentLoaded < Constants.MaxDOMContentLoadedTime,
		text: `DOMContentLoaded event is fired after ${time2Str(data.loadingTimes.domContentLoaded)}`,
		additionalText: `passed: ${time2Str(Constants.MaxDOMContentLoadedTime)}`,
	};
}

export function checkLoadTime(data: CheckerData): CheckerResult {
	return {
		success: data.loadingTimes.load < Constants.MaxLoadTime,
		text: `load event is fired after ${time2Str(data.loadingTimes.load)}`,
		additionalText: `passed: ${time2Str(Constants.MaxLoadTime)}`,
	};
}

export function checkRequestsCount(data: CheckerData): CheckerResult {
	return {
		success: data.requests.length < Constants.MaxRequestsCount,
		text: `total requests count is ${data.requests.length}`,
		additionalText: `passed: ${Constants.MaxRequestsCount}`,
	};
}

export function checkEntryHtmlSize(data: CheckerData): CheckerResult {
	const entryPageRequest = data.requests.find((req: RequestInfo) => req.url === data.openedUrl);
	const sizeStr = entryPageRequest !== undefined ? size2Str(entryPageRequest.encodedDataLength) : 'n/a';
	return {
		success: entryPageRequest !== undefined && entryPageRequest.encodedDataLength < Constants.MaxEntryHtmlSize,
		text: `size of entry html file is ${sizeStr}`,
		additionalText: `passed: ${size2Str(Constants.MaxEntryHtmlSize)}`,
	};
}

export function checkTotalLoadedSize(data: CheckerData): CheckerResult {
	const totalSize = data.requests.reduce((res: number, req: RequestInfo) => res + req.encodedDataLength, 0);
	return {
		success: totalSize < Constants.MaxTotalLoadedSize,
		text: `total loaded size until load event is ${size2Str(totalSize)}`,
		additionalText: `passed: ${size2Str(Constants.MaxTotalLoadedSize)}`,
	};
}

export function checkHavingRedirect(data: CheckerData): CheckerResult {
	return {
		success: data.openedUrl === data.requestedUrl,
		text: 'no redirects',
		additionalText: `req: ${data.requestedUrl}, opened: ${data.openedUrl}`,
	};
}

function size2Str(size: number): string {
	const suffixes = ['b', 'KB', 'MB'];

	let index = 0;
	while (size >= 1024 && (index < (suffixes.length - 1))) {
		size /= 1024;
		index += 1;
	}

	return `${size.toFixed(2)}${suffixes[index]}`;
}

function time2Str(time: number): string {
	const suffixes = ['ms', 's', 'm'];

	let index = 0;
	while (time >= 1000 && (index < (suffixes.length - 1))) {
		time /= 1000;
		index += 1;
	}

	return `${time.toFixed(2)}${suffixes[index]}`;
}
