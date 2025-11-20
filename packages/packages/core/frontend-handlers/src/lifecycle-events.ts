import { handlers } from './handlers-registry';

const unmountCallbacks: Map< string, Map< string, () => void > > = new Map();

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

	element.dispatchEvent(
		new CustomEvent( 'elementor/element/rendered', {
			bubbles: true,
			detail: {
				element,
				elementType,
				elementId,
			},
		} )
	);

	if ( ! handlers.has( elementType ) ) {
		return;
	}

	Array.from( handlers.get( elementType )?.values() ?? [] ).forEach( ( registration ) => {
		const settings = element.getAttribute( 'data-e-settings' );

		const listenToChildren = ( elementTypes: string[] ) => ( {
			render: ( callback: () => void ) => {
				element.addEventListener(
					'elementor/element/rendered',
					( event ) => {
						const { elementType: childType } = ( event as CustomEvent ).detail;

						if ( ! elementTypes.includes( childType ) ) {
							return;
						}

						callback();

						event.stopPropagation();
					},
					{ signal: controller.signal }
				);
			},
		} );

		const unmount = registration.callback( {
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

export const onElementDestroy = ( { elementType, elementId }: { elementType: string; elementId: string } ) => {
	const unmount = unmountCallbacks.get( elementType )?.get( elementId );

	if ( ! unmount ) {
		return;
	}

	unmount();

	unmountCallbacks.get( elementType )?.delete( elementId );

	if ( unmountCallbacks.get( elementType )?.size === 0 ) {
		unmountCallbacks.delete( elementType );
	}
};
