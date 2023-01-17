import { normalizeEvent } from './utils';
import { CommandEventDescriptor, EventDescriptor, ListenerCallback, WindowEventDescriptor } from './types';

const callbacksByEvent = new Map<EventDescriptor['name'], ListenerCallback[]>();
let abortController = new AbortController();

export function listenTo(
	eventDescriptors: EventDescriptor | EventDescriptor[],
	callback: ListenerCallback
) {
	if ( ! Array.isArray( eventDescriptors ) ) {
		eventDescriptors = [ eventDescriptors ];
	}

	eventDescriptors.forEach( ( event ) => {
		const { type, name } = event;

		switch ( type ) {
			case 'command':
				registerCommandListener( name, event.state, callback );
				break;

			case 'window-event':
				registerWindowEventListener( name, callback );
				break;
		}
	} );
}

export function flushListeners() {
	abortController.abort();
	callbacksByEvent.clear();

	abortController = new AbortController();
}

function registerCommandListener(
	command: CommandEventDescriptor['name'],
	state: CommandEventDescriptor['state'],
	callback: ListenerCallback
) {
	registerWindowEventListener( `elementor/commands/run/${ state }`, ( e ) => {
		const shouldRunCallback = e.type === 'command' && e.command === command;

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

	callbacksByEvent.get( event )!.push( callback );
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
		const normalizedEvent = normalizeEvent( e );

		callbacksByEvent.get( event )?.forEach( ( callback ) => {
			callback( normalizedEvent );
		} );
	};
}
