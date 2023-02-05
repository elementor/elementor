import { ListenerEvent } from './types';

export function normalizeEvent( e: ListenerEvent['originalEvent'] ): ListenerEvent {
	if ( e instanceof CustomEvent && e.detail?.command ) {
		return {
			type: 'command',
			command: e.detail.command,
			args: e.detail.args,
			originalEvent: e,
		};
	}

	if ( e instanceof CustomEvent && e.detail?.route ) {
		return {
			type: 'route',
			route: e.detail.route,
			originalEvent: e,
		};
	}

	return {
		type: 'window-event',
		event: e.type,
		originalEvent: e,
	};
}
