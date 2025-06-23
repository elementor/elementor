import * as React from 'react';

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
declare const createError: <T extends ElementorErrorOptions["context"]>({ code, message }: CreateErrorParams) => {
    new ({ cause, context }?: {
        cause?: ElementorErrorOptions["cause"];
        context?: T;
    }): {
        readonly context: ElementorErrorOptions["context"];
        readonly code: ElementorErrorOptions["code"];
        name: string;
        message: string;
        stack?: string;
        cause?: unknown;
    };
    captureStackTrace(targetObject: object, constructorOpt?: Function): void;
    prepareStackTrace(err: Error, stackTraces: NodeJS.CallSite[]): any;
    stackTraceLimit: number;
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

declare function debounce<TArgs extends any[]>(fn: (...args: TArgs) => void, wait: number): {
    (...args: TArgs): void;
    flush: (...args: TArgs) => void;
    cancel: () => void;
    pending: () => boolean;
};

export { type CreateErrorParams, ElementorError, type ElementorErrorOptions, type UseDebounceStateOptions, type UseDebounceStateResult, createError, debounce, ensureError, useDebounceState };
