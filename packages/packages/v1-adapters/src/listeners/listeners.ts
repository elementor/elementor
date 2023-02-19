import { normalizeEvent } from './utils';
import {
	CommandEventDescriptor,
	EventDescriptor,
	ListenerCallback,
	RouteEventDescriptor,
	WindowEventDescriptor,
} from './types';
import { isReady, setReady } from './is-ready';

const callbacksByEvent = new Map<EventDescriptor['name'], ListenerCallback[]>();
let abortController = new AbortController();

export function listenTo(
	eventDescriptors: EventDescriptor | EventDescriptor[],
	callback: ListenerCallback
) {
	if ( ! Array.isArray( eventDescriptors ) ) {
		eventDescriptors = [ eventDescriptors ];
	}

	// @see https://github.com/typescript-eslint/typescript-eslint/issues/2841
	// eslint-disable-next-line array-callback-return -- Clashes with typescript.
	const cleanups = eventDescriptors.map( ( event ) => {
		const { type, name } = event;

		switch ( type ) {
			case 'command':
				return registerCommandListener( name, event.state, callback );

			case 'route':
				return registerRouteListener( name, event.state, callback );

			case 'window-event':
				return registerWindowEventListener( name, callback );
		}
	} );

	return () => {
		cleanups.forEach( ( cleanup ) => cleanup() );
	};
}

export function flushListeners() {
	abortController.abort();
	callbacksByEvent.clear();
	setReady( false );

	abortController = new AbortController();
}

function registerCommandListener(
	command: CommandEventDescriptor['name'],
	state: CommandEventDescriptor['state'],
	callback: ListenerCallback
) {
	return registerWindowEventListener( `elementor/commands/run/${ state }`, ( e ) => {
		const shouldRunCallback = e.type === 'command' && e.command === command;

		if ( shouldRunCallback ) {
			callback( e );
		}
	} );
}

function registerRouteListener(
	route: RouteEventDescriptor['name'],
	state: RouteEventDescriptor['state'],
	callback: ListenerCallback
) {
	return registerWindowEventListener( `elementor/routes/${ state }`, ( e ) => {
		const shouldRunCallback = e.type === 'route' && e.route.startsWith( route );

		if ( shouldRunCallback ) {
			callback( e );
		}
	} );
}

function registerWindowEventListener( event: WindowEventDescriptor['name'], callback: ListenerCallback ) {
	const isFirstListener = ! callbacksByEvent.has( event );

	if ( isFirstListener ) {
		callbacksByEvent.set( event, [] );

		addListener( event );
	}

	callbacksByEvent.get( event )?.push( callback );

	return () => {
		const callbacks = callbacksByEvent.get( event );

		if ( ! callbacks?.length ) {
			return;
		}

		const filtered = callbacks.filter( ( cb ) => cb !== callback );

		callbacksByEvent.set( event, filtered );
	};
}

function addListener( event: EventDescriptor['name'] ) {
	window.addEventListener(
		event,
		makeEventHandler( event ),
		{ signal: abortController.signal }
	);
}

function makeEventHandler( event: EventDescriptor['name'] ): EventListener {
	return ( e ) => {
		if ( ! isReady() ) {
			return;
		}

		const normalizedEvent = normalizeEvent( e );

		callbacksByEvent.get( event )?.forEach( ( callback ) => {
			callback( normalizedEvent );
		} );
	};
}
