import { getCurrentDocument, getV1DocumentsManager } from '@elementor/editor-documents';
import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';
import { __dispatch as dispatch } from '@elementor/store';

import { slice } from '../../store';

let isDeleted = false;

export const deleteClass = ( id: string ) => {
	dispatch( slice.actions.delete( id ) );

	isDeleted = true;
};

export const onDelete = async () => {
	await reloadDocument();

	isDeleted = false;
};

export const hasDeletedItems = () => isDeleted;

// When deleting a class, we remove it from all the documents that have it applied.
// In order to reflect the changes in the active document, we need to reload it.
const reloadDocument = () => {
	const currentDocument = getCurrentDocument();
	const documentsManager = getV1DocumentsManager();

	documentsManager.invalidateCache();

	return runCommand( 'editor/documents/switch', {
		id: currentDocument?.id,
		shouldScroll: false,
		shouldNavigateToDefaultRoute: false,
	} );
};
