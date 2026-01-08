import { handlers } from './handlers-registry';

const unmountCallbacks: Map< string, Map< string, () => void > > = new Map();

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
	const controller = new AbortController();
	const manualUnmount: ( () => void )[] = [];

	const dispatchRenderedEvent = () => {
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

	// When the rendered event is dispatched, the element is not yet connected to the DOM (marrionet view case)
	if ( ! element.isConnected ) {
		requestAnimationFrame( () => {
			dispatchRenderedEvent();
		} );
	} else {
		dispatchRenderedEvent();
	}

	if ( ! handlers.has( elementType ) ) {
		return;
	}

	Array.from( handlers.get( elementType )?.values() ?? [] ).forEach( ( handler ) => {
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

	if ( ! unmountCallbacks.has( elementType ) ) {
		unmountCallbacks.set( elementType, new Map() );
	}

	unmountCallbacks.get( elementType )?.set( elementId, () => {
		controller.abort();

		manualUnmount.forEach( ( callback ) => callback() );
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
	const unmount = unmountCallbacks.get( elementType )?.get( elementId );

	if ( element ) {
		dispatchDestroyedEvent( { element, elementType, elementId } );
	}

	if ( ! unmount ) {
		return;
	}

	unmount();

	unmountCallbacks.get( elementType )?.delete( elementId );

	if ( unmountCallbacks.get( elementType )?.size === 0 ) {
		unmountCallbacks.delete( elementType );
	}
};
