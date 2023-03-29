export type ExtendedWindow = Window & {
	__elementorEditorV1LoadingPromise?: Promise<void>;
};

export type CommandEventDescriptor = {
	type: 'command',
	name: string,
	state: 'before' | 'after',
};

export type RouteEventDescriptor = {
	type: 'route',
	name: string,
	state: 'open' | 'close',
};

export type WindowEventDescriptor = {
	type: 'window-event',
	name: string,
};

export type CommandEvent<TArgs extends object = object> = {
	type: CommandEventDescriptor['type'],
	command: string,
	args: TArgs,
	originalEvent: CustomEvent,
};

export type RouteEvent = {
	type: RouteEventDescriptor['type'],
	route: string,
	originalEvent: CustomEvent,
};

export type WindowEvent = {
	type: WindowEventDescriptor['type'],
	event: string,
	originalEvent: Event,
};

export type EventDescriptor = CommandEventDescriptor | WindowEventDescriptor | RouteEventDescriptor;

export type ListenerEvent = WindowEvent | CommandEvent | RouteEvent;

export type ListenerCallback = ( e: ListenerEvent ) => void;
