import { type Document, getV1DocumentsManager } from '@elementor/editor-documents';

type ComponentDocumentData = Document;

export const getComponentDocumentData = async ( id: number ) => {
	const documentManager = getV1DocumentsManager();

	try {
		return await documentManager.request< ComponentDocumentData >( id );
	} catch {
		return null;
	}
};
