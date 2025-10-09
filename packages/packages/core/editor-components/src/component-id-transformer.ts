import { createTransformer } from '@elementor/editor-canvas';

type ComponentIdTransformerWindow = Window & {
	elementor?: {
		documents?: {
			request: ( id: string ) => Promise< { elements?: unknown[] } >;
		};
	};
};

export const componentIdTransformer = createTransformer( async ( id: string ) => {
	const extendedWindow = window as unknown as ComponentIdTransformerWindow;

	const documentManager = extendedWindow.elementor?.documents;

	if ( ! documentManager ) {
		throw new Error( 'Elementor documents manager not found' );
	}

	const data = await documentManager.request( id );

	return data.elements ?? [];
} );
