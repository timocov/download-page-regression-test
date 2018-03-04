import {
	CheckerData,
	ParameterlessChecker,
	ParameterizedChecker,
	RequestInfo,
} from './checker';

const enum DefaultValues {
	MaxDOMContentLoadedTime = 3000,
	MaxLoadTime = 5000,
	MaxRequestsCount = 30,
	MaxEntryHtmlSize = 14336,
	MaxTotalLoadedSize = 1048576,
}

export const checkers: ReadonlyArray<ParameterizedChecker<number> | ParameterizedChecker<string> | ParameterlessChecker> = [
	{
		name: 'dom-content-loaded-time',
		defValue: DefaultValues.MaxDOMContentLoadedTime,
		check: (data: CheckerData, maxValue: number) => {
			return {
				success: data.loadingTimes.domContentLoaded < maxValue,
				text: `DOMContentLoaded event is fired after ${time2Str(data.loadingTimes.domContentLoaded)}`,
				additionalText: `passed: ${time2Str(maxValue)}`,
			};
		},
	},
	{
		name: 'load-time',
		defValue: DefaultValues.MaxLoadTime,
		check: (data: CheckerData, maxValue: number) => {
			return {
				success: data.loadingTimes.load < maxValue,
				text: `load event is fired after ${time2Str(data.loadingTimes.load)}`,
				additionalText: `passed: ${time2Str(maxValue)}`,
			};
		},
	},
	{
		name: 'no-redirects',
		check: (data: CheckerData) => {
			return {
				success: data.openedUrl === data.requestedUrl,
				text: 'no redirects',
				additionalText: `req: ${data.requestedUrl}, opened: ${data.openedUrl}`,
			};
		},
	},
	{
		name: 'requests-count',
		defValue: DefaultValues.MaxRequestsCount,
		check: (data: CheckerData, maxValue: number) => {
			return {
				success: data.requests.length < maxValue,
				text: `total requests count is ${data.requests.length}`,
				additionalText: `passed: ${maxValue}`,
			};
		},
	},
	{
		name: 'entry-html-file-size',
		defValue: DefaultValues.MaxEntryHtmlSize,
		check: (data: CheckerData, maxValue: number) => {
			const entryPageRequest = data.requests.find((req: RequestInfo) => req.url === data.openedUrl);
			const sizeStr = entryPageRequest !== undefined ? size2Str(entryPageRequest.encodedDataLength) : 'n/a';
			return {
				success: entryPageRequest !== undefined && entryPageRequest.encodedDataLength < maxValue,
				text: `size of entry html file is ${sizeStr}`,
				additionalText: `passed: ${size2Str(maxValue)}`,
			};
		},
	},
	{
		name: 'total-loaded-size',
		defValue: DefaultValues.MaxTotalLoadedSize,
		check: (data: CheckerData, maxValue: number) => {
			const totalSize = data.requests.reduce((res: number, req: RequestInfo) => res + req.encodedDataLength, 0);
			return {
				success: totalSize < maxValue,
				text: `total loaded size until load event is ${size2Str(totalSize)}`,
				additionalText: `passed: ${size2Str(maxValue)}`,
			};
		},
	},
];

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
