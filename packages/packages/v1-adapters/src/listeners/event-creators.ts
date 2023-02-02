import { CommandEventDescriptor, WindowEventDescriptor } from './types';

export const commandStartEvent = ( command: CommandEventDescriptor['name'] ) : CommandEventDescriptor => {
	return {
		type: 'command',
		name: command,
		state: 'before',
	};
};

export const commandEndEvent = ( command: CommandEventDescriptor['name'] ) : CommandEventDescriptor => {
	return {
		type: 'command',
		name: command,
		state: 'after',
	};
};

export const windowEvent = ( event: WindowEventDescriptor['name'] ) : WindowEventDescriptor => {
	return {
		type: 'window-event',
		name: event,
	};
};

export const v1ReadyEvent = () => {
	return windowEvent( 'elementor/v1/initialized' );
};
