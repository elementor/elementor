import { handlers } from './handlers-registry';

type ExtendedWindow = Window & {
	elementorFrontend: {
		isEditMode: () => boolean;
	};
};

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

	if ( ! handlers.has( elementType ) ) {
		return;
	}

	Array.from( handlers.get( elementType )?.values() ?? [] ).forEach( ( handler ) => {
		const extendedWindow = window as unknown as ExtendedWindow;
		const isEditor = !! extendedWindow.elementorFrontend?.isEditMode?.();

		const unmount = handler( { element, signal: controller.signal, isEditor } );

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
