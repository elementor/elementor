export type CommandEventDescriptor = {
	type: 'command',
	name: string,
	state: 'before' | 'after',
};

export type CommandEvent = CustomEvent<{type: 'command', command: string}>;

export type WindowEventDescriptor = {
	type: 'event',
	name: string,
};

export type WindowEvent = Event;

export type EventDescriptor = CommandEventDescriptor | WindowEventDescriptor;

export type ListenerEvent = WindowEvent | CommandEvent;

export type ListenerCallback = ( e: ListenerEvent ) => void;

