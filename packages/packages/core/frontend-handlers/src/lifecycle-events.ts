import { elementSelectorHandlers, elementTypeHandlers } from './handlers-registry';

const unmountElementTypeCallbacks: Map< string, Map< string, () => void > > = new Map();
const unmountElementSelectorCallbacks: Map< string, Map< string, () => void > > = new Map();

const ELEMENT_RENDERED_EVENT_NAME = 'elementor/element/rendered';

export const onElementRender = ( {
	element,
	elementType,
	elementId,
}: {
	element: Element;
	elementType: string;
	elementId: string;
} ) => {
	const controller = new AbortController();
	const manualUnmount: ( () => void )[] = [];

	const dispatchRenderedEvent = () => {
		onElementSelectorRender( { element, elementId, controller } );

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
				element.addEventListener(
					ELEMENT_RENDERED_EVENT_NAME,
					( event ) => {
						const { elementType: childType } = ( event as CustomEvent ).detail;

						if ( ! elementTypes.includes( childType ) ) {
							return;
						}

						callback();
					},
					{ signal: controller.signal }
				);
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

	if ( ! unmountElementTypeCallbacks.has( elementType ) ) {
		unmountElementTypeCallbacks.set( elementType, new Map() );
	}

	unmountElementTypeCallbacks.get( elementType )?.set( elementId, () => {
		controller.abort();

		manualUnmount.forEach( ( callback ) => callback() );
	} );
};

export const onElementSelectorRender = ( {
	element,
	elementId,
	controller,
}: {
	element: Element;
	elementId: string;
	controller: AbortController;
} ) => {
	Array.from( elementSelectorHandlers.entries() ?? [] ).forEach( ( [ selector, handlers ] ) => {
		if ( ! element.matches( selector ) ) {
			return;
		}

		const manualUnmount: ( () => void )[] = [];

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

		if ( ! manualUnmount.length ) {
			return;
		}

		if ( ! unmountElementSelectorCallbacks.get( elementId ) ) {
			unmountElementSelectorCallbacks.set( elementId, new Map() );
		}

		unmountElementSelectorCallbacks.get( elementId )?.set( selector, () => {
			controller.abort();

			manualUnmount.forEach( ( callback ) => callback() );
		} );
	} );
};

export const onElementDestroy = ( { elementType, elementId }: { elementType: string; elementId: string } ) => {
	const unmount = unmountElementTypeCallbacks.get( elementType )?.get( elementId );
	const unmountSelector = unmountElementSelectorCallbacks.get( elementId );

	if ( unmount ) {
		unmount();
	}

	if ( unmountSelector?.size ) {
		Array.from( unmountSelector.values() ).forEach( ( selectorUnmount ) => {
			selectorUnmount();
		} );
	}

	unmountElementTypeCallbacks.get( elementType )?.delete( elementId );
	unmountElementSelectorCallbacks.delete( elementId );

	if ( unmountElementTypeCallbacks.get( elementType )?.size === 0 ) {
		unmountElementTypeCallbacks.delete( elementType );
	}

	if ( unmountElementSelectorCallbacks.size === 0 ) {
		unmountElementSelectorCallbacks.delete( elementId );
	}
};
