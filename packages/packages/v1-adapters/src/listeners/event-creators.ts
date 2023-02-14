import { CommandEventDescriptor, RouteEventDescriptor, WindowEventDescriptor } from './types';

export const commandStartEvent = ( command: CommandEventDescriptor['name'] ): CommandEventDescriptor => {
	return {
		type: 'command',
		name: command,
		state: 'before',
	};
};

export const commandEndEvent = ( command: CommandEventDescriptor['name'] ): CommandEventDescriptor => {
	return {
		type: 'command',
		name: command,
		state: 'after',
	};
};

export const routeOpenEvent = ( route: RouteEventDescriptor['name'] ): RouteEventDescriptor => {
	return {
		type: 'route',
		name: route,
		state: 'open',
	};
};

export const routeCloseEvent = ( route: RouteEventDescriptor['name'] ): RouteEventDescriptor => {
	return {
		type: 'route',
		name: route,
		state: 'close',
	};
};

export const windowEvent = ( event: WindowEventDescriptor['name'] ): WindowEventDescriptor => {
	return {
		type: 'window-event',
		name: event,
	};
};

export const v1ReadyEvent = () => {
	return windowEvent( 'elementor/initialized' );
};

export const editModeChangeEvent = () => {
	return windowEvent( 'elementor/edit-mode/change' );
};
