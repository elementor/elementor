import { type V1ElementData } from '@elementor/editor-elements';

import { type DocumentStatus } from '../types';

type ComponentDocumentData = {
	id: number;
	elements?: V1ElementData[];
	status: { value: DocumentStatus };
	revisions: { current_id: number };
};

type ComponentIdTransformerWindow = Window & {
	elementor?: {
		documents?: {
			request: ( id: number ) => Promise< ComponentDocumentData >;
			invalidateCache: ( id: number ) => void;
		};
	};
};

export const getComponentDocumentData = async ( id: number ) => {
	const documentManager = getDocumentsManager();

	try {
		return await documentManager.request( id );
	} catch {
		return null;
	}
};

export const invalidateComponentDocumentData = ( id: number ) => {
	const documentManager = getDocumentsManager();

	documentManager.invalidateCache( id );
};

function getDocumentsManager() {
	const extendedWindow = window as unknown as ComponentIdTransformerWindow;

	const documentManager = extendedWindow.elementor?.documents;

	if ( ! documentManager ) {
		throw new Error( 'Elementor documents manager not found' );
	}

	return documentManager;
}
