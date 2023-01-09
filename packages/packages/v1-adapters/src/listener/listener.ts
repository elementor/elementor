import { v1Init } from './event-creators';
import {
	CommandEventDescriptor,
	ListenerCallback,
	EventDescriptor,
	WindowEventDescriptor,
	CommandEvent,
	ListenerEvent,
} from './types';
import { dispatchWhenV1Initiated } from './utils';

let callbacks : Record<EventDescriptor['name'], ListenerCallback[]> = {};
let listeners : Record<EventDescriptor['name'], EventListener> = {};

export function listenTo(
	EventDescriptors : EventDescriptor | EventDescriptor[],
	callback : ListenerCallback
) {
	if ( ! Array.isArray( EventDescriptors ) ) {
		EventDescriptors = [ EventDescriptors ];
	}

	EventDescriptors.map( ( event ) => {
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

export function startV1Listeners() {
	Object.keys( callbacks ).forEach( ( event ) => {
		const listener : ListenerCallback = ( e ) => {
			callbacks[ event ].forEach( ( callback ) => {
				callback( e );
			} );
		};

		window.addEventListener( event, listener );

		listeners[ event ] = listener;
	} );

	return dispatchWhenV1Initiated();
}

export function flushListeners() {
	Object.entries( listeners ).forEach( ( [ event, listener ] ) => {
		window.removeEventListener( event, listener );
	} );

	listeners = {};
	callbacks = {};
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
	callbacks[ event ] = callbacks[ event ] || [];

	callbacks[ event ].push( callback );
}
