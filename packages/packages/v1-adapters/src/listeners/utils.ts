import { ListenerEvent } from './types';

export function dispatchReadyEvent() {
	return getV1LoadingPromise().then( () => {
		window.dispatchEvent( new CustomEvent( 'elementor/v1/initialized' ) );
	} );
}

function getV1LoadingPromise() {
	if ( ! ( window as any ).__elementorEditorV1LoadingPromise ) {
		return Promise.reject( 'Elementor Editor V1 is not loaded' );
	}

	return ( window as any ).__elementorEditorV1LoadingPromise;
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

	return {
		type: 'window-event',
		event: e.type,
		originalEvent: e,
	};
}
