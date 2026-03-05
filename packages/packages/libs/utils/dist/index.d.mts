import type * as React from 'react';

type ElementorErrorOptions = {
	cause?: Error['cause'];
	context?: Record<string, unknown> | null;
	code: string;
};
declare class ElementorError extends Error {
	readonly context: ElementorErrorOptions['context'];
	readonly code: ElementorErrorOptions['code'];
	constructor(message: string, { code, context, cause }: ElementorErrorOptions);
}

type CreateErrorParams = {
	code: ElementorErrorOptions['code'];
	message: string;
};
declare const createError: <T extends ElementorErrorOptions['context']>({
	code,
	message,
}: CreateErrorParams) => {
	new ({ cause, context }?: { cause?: ElementorErrorOptions['cause']; context?: T }): {
		readonly context: ElementorErrorOptions['context'];
		readonly code: ElementorErrorOptions['code'];
		name: string;
		message: string;
		stack?: string;
		cause?: unknown;
	};
	isError(error: unknown): error is Error;
};

declare const ensureError: (error: unknown) => Error;

type UseDebounceStateOptions = {
	delay?: number;
	initialValue?: string;
};
type UseDebounceStateResult = {
	debouncedValue: string;
	inputValue: string;
	handleChange: (val: string) => void;
	setInputValue: React.Dispatch<React.SetStateAction<string>>;
};
declare function useDebounceState(options?: UseDebounceStateOptions): UseDebounceStateResult;

declare function debounce<TArgs extends any[]>(
	fn: (...args: TArgs) => void,
	wait: number
): {
	(...args: TArgs): void;
	flush: (...args: TArgs) => void;
	cancel: () => void;
	pending: () => boolean;
};

declare function throttle<TArgs extends any[]>(
	fn: (...args: TArgs) => void,
	wait: number,
	shouldExecuteIgnoredCalls?: boolean
): {
	(...args: TArgs): void;
	flush: (...args: TArgs) => void;
	cancel: () => void;
	pending: () => boolean;
};

declare const encodeString: (value: string) => string;
declare const decodeString: <T = string>(value: string, fallback?: T) => string | T;

type UnknownObject = Record<string, unknown>;
declare function hash(obj: UnknownObject): string;
declare function hashString(str: string, length?: number): string;

type UseSearchStateResult = UseDebounceStateResult;
declare function useSearchState({ localStorageKey }: { localStorageKey?: string }): {
	debouncedValue: string;
	inputValue: string;
	handleChange: (val: string) => void;
};

declare function generateUniqueId(prefix?: string): string;

declare const capitalize: (str: string) => string;

declare const compareVersions: (a: string | number, b: string | number) => number;
declare const isVersionLessThan: (a: string | number, b: string | number) => boolean;
declare const isVersionGreaterOrEqual: (a: string | number, b: string | number) => boolean;

declare function hasProInstalled(): boolean;
declare function isProActive(): boolean;

type TranslateFunction = (key: string, ...args: string[]) => string;
interface CreateTranslateOptions {
	configKey: string;
	defaultStrings?: Record<string, string>;
}
declare function createTranslate({ configKey, defaultStrings }: CreateTranslateOptions): TranslateFunction;

export {
	type CreateErrorParams,
	ElementorError,
	type ElementorErrorOptions,
	type UseDebounceStateOptions,
	type UseDebounceStateResult,
	type UseSearchStateResult,
	capitalize,
	compareVersions,
	createError,
	createTranslate,
	debounce,
	decodeString,
	encodeString,
	ensureError,
	generateUniqueId,
	hasProInstalled,
	hash,
	hashString,
	isProActive,
	isVersionGreaterOrEqual,
	isVersionLessThan,
	throttle,
	useDebounceState,
	useSearchState,
};
