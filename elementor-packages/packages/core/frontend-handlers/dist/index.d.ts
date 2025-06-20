type Handler = (params: {
    element: Element;
    signal: AbortSignal;
}) => (() => void) | undefined;
declare const register: ({ elementType, id, callback }: {
    elementType: string;
    id: string;
    callback: Handler;
}) => void;
declare const unregister: ({ elementType, id }: {
    elementType: string;
    id?: string;
}) => void;

declare function init(): void;

export { init, register, unregister };
