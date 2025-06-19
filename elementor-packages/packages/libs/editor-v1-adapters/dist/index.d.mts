type RunCommandOptions = {
    internal?: boolean;
};
declare function runCommand(command: string, args?: object, { internal }?: RunCommandOptions): Promise<any>;
declare function runCommandSync(command: string, args?: object, { internal }?: RunCommandOptions): unknown;
declare function openRoute(route: string): Promise<unknown>;
declare function registerRoute(route: string): Promise<unknown>;

type ExtendedWindow = Window & {
    __elementorEditorV1LoadingPromise?: Promise<void>;
};
type CommandEventDescriptor = {
    type: 'command';
    name: string;
    state: 'before' | 'after';
};
type RouteEventDescriptor = {
    type: 'route';
    name: string;
    state: 'open' | 'close';
};
type WindowEventDescriptor = {
    type: 'window-event';
    name: string;
};
type CommandEvent<TArgs extends object = object> = {
    type: CommandEventDescriptor['type'];
    command: string;
    args: TArgs;
    originalEvent: CustomEvent;
};
type RouteEvent = {
    type: RouteEventDescriptor['type'];
    route: string;
    originalEvent: CustomEvent;
};
type WindowEvent = {
    type: WindowEventDescriptor['type'];
    event: string;
    originalEvent: Event;
};
type EventDescriptor = CommandEventDescriptor | WindowEventDescriptor | RouteEventDescriptor;
type ListenerEvent = WindowEvent | CommandEvent | RouteEvent;
type ListenerCallback = (e: ListenerEvent) => void;

declare const commandStartEvent: (command: CommandEventDescriptor["name"]) => CommandEventDescriptor;
declare const commandEndEvent: (command: CommandEventDescriptor["name"]) => CommandEventDescriptor;
declare const routeOpenEvent: (route: RouteEventDescriptor["name"]) => RouteEventDescriptor;
declare const routeCloseEvent: (route: RouteEventDescriptor["name"]) => RouteEventDescriptor;
declare const windowEvent: (event: WindowEventDescriptor["name"]) => WindowEventDescriptor;
declare const v1ReadyEvent: () => WindowEventDescriptor;

declare function listenTo(eventDescriptors: EventDescriptor | EventDescriptor[], callback: ListenerCallback): () => void;
declare function flushListeners(): void;

/**
 * This file is used to store the state of the isReady variable, which is used to determine
 * if the adapter is ready to receive events (editor v1 and v2 are loaded).
 */
declare function isReady(): boolean;
declare function setReady(value: boolean): void;

declare function dispatchReadyEvent(): Promise<void>;

declare function useIsRouteActive(route: RouteEventDescriptor['name']): boolean;

declare function useListenTo<T>(event: EventDescriptor | EventDescriptor[], getSnapshot: () => T, deps?: unknown[]): T;

type EditMode = 'edit' | 'preview' | 'picker' | (string & {});
declare function useEditMode(): EditMode;
declare function changeEditMode(newMode: EditMode): void;

type UseRouteStatusOptions = {
    blockOnKitRoutes?: boolean;
    allowedEditModes?: EditMode[];
};
declare function useRouteStatus(route: RouteEventDescriptor['name'], { blockOnKitRoutes, allowedEditModes }?: UseRouteStatusOptions): {
    isActive: boolean;
    isBlocked: boolean;
};

declare function isRouteActive(route: string): boolean;
declare const isExperimentActive: (experiment: string) => boolean;

type Payload = Record<string, any> | undefined;
type LabelGenerator<TPayload extends Payload, TDoReturn> = (payload: TPayload, doReturn: TDoReturn) => string;
type Actions<TPayload extends Payload, TDoReturn, TUndoReturn> = {
    do: (payload: TPayload) => Awaited<TDoReturn>;
    undo: (payload: TPayload, doReturn: Awaited<TDoReturn>) => Awaited<TUndoReturn>;
    redo?: (payload: TPayload, doReturn: Awaited<TDoReturn>) => Awaited<TDoReturn>;
};
type Options<TPayload extends Payload, TDoReturn> = {
    title: string | LabelGenerator<TPayload, TDoReturn>;
    subtitle?: string | LabelGenerator<TPayload, TDoReturn>;
};
declare function undoable<TDoReturn, TUndoReturn>(actions: Actions<undefined, TDoReturn, TUndoReturn>, options: Options<undefined, NoInfer<TDoReturn>>): () => TDoReturn;
declare function undoable<TPayload extends NonNullable<Payload>, TDoReturn, TUndoReturn>(actions: Actions<TPayload, TDoReturn, TUndoReturn>, options: Options<TPayload, NoInfer<TDoReturn>>): (payload: TPayload) => TDoReturn;

type HistoryItem = {
    title: string;
    subTitle: string;
    type: string;
    restore: (item: HistoryItem, isRedo: boolean) => void;
};
type AddHistoryItem = (item: HistoryItem) => void;
type WindowWithHistoryManager = Window & {
    elementor?: {
        documents?: {
            getCurrent?: () => {
                history?: {
                    addItem: AddHistoryItem;
                };
            };
        };
    };
};

type Args = Record<string, unknown>;
declare class DataHook {
    getCommand(): string;
    getId(): string;
    apply(args: Args): unknown;
    register(): void;
}
declare function registerDataHook(type: 'dependency', command: string, callback: (args: Args) => boolean): DataHook;
declare function registerDataHook(type: 'after', command: string, callback: (args: Args) => void | Promise<void>): DataHook;

type BlockCommandArgs = {
    command: string;
    condition: (args: Args) => boolean;
};
declare function blockCommand({ command, condition }: BlockCommandArgs): DataHook;

export { type CommandEvent, type CommandEventDescriptor, type EditMode, type EventDescriptor, type ExtendedWindow, type HistoryItem, type ListenerCallback, type ListenerEvent, type RouteEvent, type RouteEventDescriptor, type UseRouteStatusOptions, type WindowEvent, type WindowEventDescriptor, type WindowWithHistoryManager, dispatchReadyEvent as __privateDispatchReadyEvent, flushListeners as __privateFlushListeners, isRouteActive as __privateIsRouteActive, listenTo as __privateListenTo, openRoute as __privateOpenRoute, registerRoute as __privateRegisterRoute, runCommand as __privateRunCommand, runCommandSync as __privateRunCommandSync, setReady as __privateSetReady, useIsRouteActive as __privateUseIsRouteActive, useListenTo as __privateUseListenTo, useRouteStatus as __privateUseRouteStatus, blockCommand, changeEditMode, commandEndEvent, commandStartEvent, dispatchReadyEvent, flushListeners, isExperimentActive, isReady, listenTo, registerDataHook, routeCloseEvent, routeOpenEvent, setReady, undoable, useEditMode, v1ReadyEvent, windowEvent };
