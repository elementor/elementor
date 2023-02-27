import { ExtendedWindow, ListenerEvent } from './types';
import { setReady } from './is-ready';

export function dispatchReadyEvent() {
	return getV1LoadingPromise().then( () => {
		setReady( true );
		window.dispatchEvent( new CustomEvent( 'elementor/initialized' ) );
	} );
}

function getV1LoadingPromise() {
	const v1LoadingPromise = ( window as unknown as ExtendedWindow ).__elementorEditorV1LoadingPromise;

	if ( ! v1LoadingPromise ) {
		return Promise.reject( 'Elementor Editor V1 is not loaded' );
	}

	return v1LoadingPromise;
}

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
