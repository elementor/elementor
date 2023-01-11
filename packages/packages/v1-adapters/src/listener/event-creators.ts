import { CommandEventDescriptor, WindowEventDescriptor } from './types';

export const commandStart = ( command: CommandEventDescriptor['name'] ) : CommandEventDescriptor => {
	return {
		type: 'command',
		name: command,
		state: 'before',
	};
};

export const commandEnd = ( command: CommandEventDescriptor['name'] ) : CommandEventDescriptor => {
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

export const v1Ready = () => {
	return windowEvent( 'elementor/v1/initialized' );
};
