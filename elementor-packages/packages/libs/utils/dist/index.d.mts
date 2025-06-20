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

declare function debounce<TArgs extends any[]>(fn: (...args: TArgs) => void, wait: number): {
    (...args: TArgs): void;
    flush: (...args: TArgs) => void;
    cancel: () => void;
    pending: () => boolean;
};

export { type CreateErrorParams, ElementorError, type ElementorErrorOptions, createError, debounce, ensureError };
