import { elementSelectorHandlers, elementTypeHandlers } from './handlers-registry';

type UnmountEntry = {
	controller: AbortController;
	manualUnmount: ( () => void )[];
};

const unmountCallbacks = new WeakMap< Element, UnmountEntry >();

const ELEMENT_RENDERED_EVENT_NAME = 'elementor/element/rendered';
const ELEMENT_DESTROYED_EVENT_NAME = 'elementor/element/destroyed';

type LifecycleEventParams = {
	element: Element;
	elementType: string;
	elementId: string;
};

const dispatchDestroyedEvent = ( params: LifecycleEventParams ) => {
	params.element.dispatchEvent(
		new CustomEvent( ELEMENT_DESTROYED_EVENT_NAME, {
			bubbles: true,
			detail: params,
		} )
	);
};

export const onElementRender = ( {
	element,
	elementType,
	elementId,
}: {
	element: Element;
	elementType: string;
	elementId: string;
} ) => {
	const existingEntry = unmountCallbacks.get( element );
	if ( existingEntry ) {
		existingEntry.controller.abort();
		existingEntry.manualUnmount.forEach( ( callback ) => callback() );
	}

	const controller = new AbortController();
	const manualUnmount: ( () => void )[] = [];

	unmountCallbacks.set( element, { controller, manualUnmount } );

	const dispatchRenderedEvent = () => {
		onElementSelectorRender( { element, controller } );

		element.dispatchEvent(
			new CustomEvent( ELEMENT_RENDERED_EVENT_NAME, {
				bubbles: true,
				detail: {
					element,
					elementType,
					elementId,
				},
			} )
		);
	};

	// When the rendered event is dispatched, the element is not yet connected to the DOM (marionette view case)
	if ( ! element.isConnected ) {
		requestAnimationFrame( () => {
			dispatchRenderedEvent();
		} );
	} else {
		dispatchRenderedEvent();
	}

	if ( ! elementTypeHandlers.has( elementType ) ) {
		return;
	}

	Array.from( elementTypeHandlers.get( elementType )?.values() ?? [] ).forEach( ( handler ) => {
		const settings = element.getAttribute( 'data-e-settings' );

		const listenToChildren = ( elementTypes: string[] ) => ( {
			render: ( callback: () => void ) => {
				const listener = ( event: Event ) => {
					const { elementType: childType } = ( event as CustomEvent ).detail;

					if ( ! elementTypes.includes( childType ) ) {
						return;
					}

					callback();
				};

				element.addEventListener( ELEMENT_RENDERED_EVENT_NAME, listener, { signal: controller.signal } );
				element.addEventListener( ELEMENT_DESTROYED_EVENT_NAME, listener, { signal: controller.signal } );
			},
		} );

		const unmount = handler( {
			element,
			signal: controller.signal,
			settings: settings ? JSON.parse( settings ) : {},
			listenToChildren,
		} );

		if ( typeof unmount === 'function' ) {
			manualUnmount.push( unmount );
		}
	} );
};

export const onElementSelectorRender = ( {
	element,
	controller,
}: {
	element: Element;
	controller: AbortController;
} ) => {
	const entry = unmountCallbacks.get( element );

	if ( ! entry ) {
		return;
	}

	Array.from( elementSelectorHandlers.entries() ?? [] ).forEach( ( [ selector, handlers ] ) => {
		if ( ! element.matches( selector ) ) {
			return;
		}

		Array.from( handlers.values() ?? [] ).forEach( ( handler ) => {
			const settings = element.getAttribute( 'data-e-settings' );

			const unmount = handler( {
				element,
				signal: controller.signal,
				settings: settings ? JSON.parse( settings ) : {},
			} );

			if ( typeof unmount === 'function' ) {
				entry.manualUnmount.push( unmount );
			}
		} );
	} );
};

export const onElementDestroy = ( {
	elementType,
	elementId,
	element,
}: {
	elementType: string;
	elementId: string;
	element?: Element;
} ) => {
	if ( ! element ) {
		return;
	}

	const entry = unmountCallbacks.get( element );

	dispatchDestroyedEvent( { element, elementType, elementId } );

	if ( entry ) {
		entry.controller.abort();
		entry.manualUnmount.forEach( ( callback ) => callback() );
		unmountCallbacks.delete( element );
	}
};
