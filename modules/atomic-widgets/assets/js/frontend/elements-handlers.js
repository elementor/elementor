const registeredHandlers = {};
const elementUnmountCallbacks = {};

const register = ( { elementType, uniqueId, callback } ) => {
	if ( ! elementType || 'string' !== typeof elementType || '' === elementType.trim() ) {
		throw new Error( 'elementType must be a non-empty string' );
	}

	if ( ! uniqueId || 'string' !== typeof uniqueId || '' === uniqueId.trim() ) {
		throw new Error( 'uniqueId must be a non-empty string' );
	}

	if ( ! registeredHandlers[ elementType ] ) {
		registeredHandlers[ elementType ] = new Map();
	}

	if ( ! registeredHandlers[ elementType ].has( uniqueId ) ) {
		registeredHandlers[ elementType ].set( uniqueId, callback );
	}

	return () => unregister( { elementType, uniqueId } );
};

const unregister = ( { elementType, uniqueId } ) => {
	if ( ! elementType || typeof elementType !== 'string' || elementType.trim() === '' ) {
		throw new Error( 'elementType must be a non-empty string' );
	}

	if ( ! registeredHandlers[ elementType ] ) {
		return;
	}

	if ( uniqueId ) {
		registeredHandlers[ elementType ].delete( uniqueId );

		if ( registeredHandlers[ elementType ].size === 0 ) {
			delete registeredHandlers[ elementType ];
		}
	} else {
		delete registeredHandlers[ elementType ];
	}
};

window.top.addEventListener( 'elementor/preview/atomic-widget/render', ( event ) => {
	const { id, type } = event.detail;

	const element = document.querySelector( `[data-element_type="${ type }"][data-id="${ id }"]` );

	if ( ! element ) {
		return;
	}

	handleElementMount( element, type, id );
} );

window.top.addEventListener( 'elementor/preview/atomic-widget/destroy', ( event ) => {
	const { id, type } = event.detail;

	if ( ! elementUnmountCallbacks[ type ] || ! elementUnmountCallbacks[ type ][ id ] ) {
		return;
	}

	elementUnmountCallbacks[ type ][ id ]();
	delete elementUnmountCallbacks[ type ][ id ];
} );

document.addEventListener( 'DOMContentLoaded', () => {
	document.querySelectorAll( '[data-element_type]' ).forEach( ( element ) => {
		const elementType = element.getAttribute( 'data-element_type' );

		if ( elementType && registeredHandlers[ elementType ] ) {
			const elementId = element.getAttribute( 'data-id' );

			if ( ! elementId ) {
				return;
			}

			handleElementMount( element, elementType, elementId );
		}
	} );
} );

const handleElementMount = ( element, elementType, elementId ) => {
	const controller = new AbortController();
	const manualUnmount = [];

	Array.from( registeredHandlers[ elementType ].values() ).forEach( callback => {
		const result = callback( { element, signal: controller.signal } );

		if ( typeof result === 'function' ) {
			manualUnmount.push( result );
		}
	} );

	if ( ! elementUnmountCallbacks[ elementType ] ) {
		elementUnmountCallbacks[ elementType ] = {};
	}

	elementUnmountCallbacks[ elementType ][ elementId ] = () => {
		controller.abort();

		manualUnmount.forEach( callback => callback() );
	};
};

/*setTimeout( () => {
	console.log( 'Removing handlers' );

	//unmount( { elementId: '79da2ea', elementType: 'e-button', uniqueId: 'e-button-hover-handler' } );
	elementUnmountCallbacks[ 'e-button' ][ '79da2ea' ]();
}, 2000 );*/

window.elementorElementsHandlers = {
	register,
	unregister,
};

/**
 * TODO:
 *  - [x] Change the register function to accept an object with the element type and the callback
 *  - [x] Add ability to register multi handlers at once element type
 *  - [ ] Add Editor support (mount & unmount)
 *  - [ ] Add element settings to the callback
 *  - [x] Add ability to dynamic import based on element settings
 *  - [x] Add ability to unregister handlers
 *  - [ ] For unregistering handlers, how to handle the unmounts?
 *  - [ ] Check performance of the handlers
 *  - [x] Added AbortController to manage the unmounts
 */
