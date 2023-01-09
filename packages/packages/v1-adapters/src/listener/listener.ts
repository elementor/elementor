import { v1Init } from './event-creators';
import { dispatchWhenV1Initiated } from './utils';
import {
	CommandEventDescriptor,
	ListenerCallback,
	EventDescriptor,
	WindowEventDescriptor,
	CommandEvent,
	ListenerEvent,
} from './types';

let callbacksByEvent : Record<EventDescriptor['name'], ListenerCallback[]> = {};
let listenersByEvent : Record<EventDescriptor['name'], EventListener> = {};

export function listenTo(
	eventDescriptors : EventDescriptor | EventDescriptor[],
	callback : ListenerCallback
) {
	if ( ! Array.isArray( eventDescriptors ) ) {
		eventDescriptors = [ eventDescriptors ];
	}

	eventDescriptors.map( ( event ) => {
		const { type, name } = event;

		switch ( type ) {
			case 'command':
				registerCommandListener( name, event.state, callback );
				break;

			case 'event':
				registerWindowEventListener( name, callback );
				break;
		}
	} );
}

export function startV1Limsteners() {
	Object.keys( callbacksByEvent ).forEach( ( event ) => {
		const listener = makeListener( event );

		window.addEventListener( event, listener );

		listenersByEvent[ event ] = listener;
	} );

	return dispatchWhenV1Initiated();
}

export function flushListeners() {
	Object.entries( listenersByEvent ).forEach( ( [ event, listener ] ) => {
		window.removeEventListener( event, listener );
	} );

	listenersByEvent = {};
	callbacksByEvent = {};
}

function registerCommandListener(
	command: CommandEventDescriptor['name'],
	state: CommandEventDescriptor['state'],
	callback: ListenerCallback
) {
	const events = [];

	registerWindowEventListener( `elementor/commands/run/${ state }`, ( e ) => {
		// TODO: Find a better solution.
		const ce = e as CommandEvent;

		if ( ce.detail.command === command ) {
			callback( e );
		}
	} );
}

function registerWindowEventListener( event: WindowEventDescriptor['name'], callback: ListenerCallback ) {
	callbacksByEvent[ event ] = callbacksByEvent[ event ] || [];

	callbacksByEvent[ event ].push( callback );
}

function makeListener( event: EventDescriptor['name'] ) : ListenerCallback {
	return ( e ) => {
		callbacksByEvent[ event ].forEach( ( callback ) => {
			callback( e );
		} );
	};
}
