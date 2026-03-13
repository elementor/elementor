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
	cleanupOnUnmount( element );

	const controller = new AbortController();
	const manualUnmount: ( () => void )[] = [];

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

	setUnmountEntry( { element, controller, manualUnmount } );

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
	let requiresCleanup = false;
	const manualUnmount: ( () => void )[] = [];

	Array.from( elementSelectorHandlers.entries() ?? [] ).forEach( ( [ selector, handlers ] ) => {
		if ( ! element.matches( selector ) ) {
			return;
		}

		requiresCleanup = true;

		Array.from( handlers.values() ?? [] ).forEach( ( handler ) => {
			const settings = element.getAttribute( 'data-e-settings' );

			const unmount = handler( {
				element,
				signal: controller.signal,
				settings: settings ? JSON.parse( settings ) : {},
			} );

			if ( typeof unmount === 'function' ) {
				manualUnmount.push( unmount );
			}
		} );
	} );

	if ( requiresCleanup ) {
		setUnmountEntry( { element, controller, manualUnmount } );
	}
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

	cleanupOnUnmount( element );

	dispatchDestroyedEvent( { element, elementType, elementId } );
};

const setUnmountEntry = ( {
	element,
	controller,
	manualUnmount,
}: {
	element: Element;
	controller: AbortController;
	manualUnmount: ( () => void )[];
} ) => {
	const existingEntry = unmountCallbacks.get( element );

	if ( existingEntry ) {
		existingEntry.manualUnmount.push( ...manualUnmount );
	} else {
		unmountCallbacks.set( element, { controller, manualUnmount } );
	}
};

const cleanupOnUnmount = ( element: Element ) => {
	const entry = unmountCallbacks.get( element );

	if ( entry ) {
		entry.controller.abort();
		entry.manualUnmount.forEach( ( callback ) => callback() );
		unmountCallbacks.delete( element );
	}
};
