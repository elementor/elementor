export type CommandEventDescriptor = {
	type: 'command',
	name: string,
	state: 'before' | 'after',
};

export type WindowEventDescriptor = {
	type: 'window-event',
	name: string,
};

export type CommandEvent = {
	type: CommandEventDescriptor['type'],
	command: string,
	args: object,
	originalEvent: CustomEvent,
};

export type WindowEvent = {
	type: WindowEventDescriptor['type'],
	event: string,
	originalEvent: Event,
};

export type EventDescriptor = CommandEventDescriptor | WindowEventDescriptor;

export type ListenerEvent = WindowEvent | CommandEvent;

export type ListenerCallback = ( e: ListenerEvent ) => void;
