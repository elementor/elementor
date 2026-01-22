import { type Document, getV1DocumentsManager } from '@elementor/editor-documents';
import { __dispatch as dispatch } from '@elementor/store';

import { slice } from '../store/store';

type ComponentDocumentData = Document;

export const getComponentDocumentData = async ( id: number ) => {
	const documentManager = getV1DocumentsManager();

	try {
		return await documentManager.request< ComponentDocumentData >( id );
	} catch {
		return null;
	}
};

export const invalidateComponentCache = ( id: number ) => {
	const documentManager = getV1DocumentsManager();

	documentManager.invalidateCache( id );
	dispatch( slice.actions.removeStyles( { id } ) );
	dispatch( slice.actions.clearOverridableProps( { componentId: id } ) );
};
