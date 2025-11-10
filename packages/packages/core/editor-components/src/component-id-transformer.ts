import { createTransformer } from '@elementor/editor-canvas';
import { __getState as getState } from '@elementor/store';

import { selectUnpublishedComponents } from './store/store';

type ComponentIdTransformerWindow = Window & {
	elementor?: {
		documents?: {
			request: ( id: number ) => Promise< { elements?: unknown[] } >;
		};
	};
};

export const componentIdTransformer = createTransformer( async ( id: number | string ) => {
	const unpublishedComponents = selectUnpublishedComponents( getState() );

	const unpublishedComponent = unpublishedComponents.find( ( component ) => component.uuid === id );
	if ( unpublishedComponent ) {
		return structuredClone( unpublishedComponent.elements );
	}

	const extendedWindow = window as unknown as ComponentIdTransformerWindow;

	const documentManager = extendedWindow.elementor?.documents;

	if ( ! documentManager ) {
		throw new Error( 'Elementor documents manager not found' );
	}

	if ( typeof id === 'string' ) {
		throw new Error( 'Component ID of a published component must be a number' );
	}

	const data = await documentManager.request( id );

	return data.elements ?? [];
} );
