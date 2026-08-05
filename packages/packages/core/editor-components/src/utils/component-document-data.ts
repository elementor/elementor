import { type Document } from '@elementor/editor-documents';

import { apiClient } from '../api';

type ComponentDocumentData = Document;

export const getComponentDocumentData = async ( id: number ) => {
	try {
		return await apiClient.getComponentConfig( id );
	} catch {
		return null;
	}
};
