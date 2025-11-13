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

type PublishedComponentId = number;
type UnpublishedComponentId = string;

type ComponentId = PublishedComponentId | UnpublishedComponentId;

export const componentIdTransformer = createTransformer( async ( id: ComponentId ) => {
	const unpublishedComponents = selectUnpublishedComponents( getState() );

	const unpublishedComponent = unpublishedComponents.find( ( component ) => component.uid === id );
	if ( unpublishedComponent ) {
		return structuredClone( unpublishedComponent.elements );
	}

	if ( typeof id !== 'number' ) {
		throw new Error( `Component ID "${ id }" not found.` );
	}

	const extendedWindow = window as unknown as ComponentIdTransformerWindow;

	const documentManager = extendedWindow.elementor?.documents;

	if ( ! documentManager ) {
		throw new Error( 'Elementor documents manager not found' );
	}

	const data = await documentManager.request( id );

	return data.elements ?? [];
} );
