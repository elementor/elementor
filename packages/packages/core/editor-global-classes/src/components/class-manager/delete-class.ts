import { getCurrentDocument, getV1DocumentsManager } from '@elementor/editor-documents';
import { getElements, getElementSettings, updateElementSettings } from '@elementor/editor-elements';
import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';
import { __dispatch as dispatch } from '@elementor/store';

import { slice } from '../../store';

let isDeleted = false;

export const deleteClass = ( id: string ) => {
	dispatch( slice.actions.delete( id ) );
	getElements().forEach( ( element ) => {
		const classes = getElementSettings< { value?: string[] } | null >( element.id, [ 'classes' ] ).classes;
		if ( classes && Array.isArray( classes.value ) && classes.value.includes( id ) ) {
			const newClasses = classes.value.filter( ( classId ) => classId !== id );
			classes.value = newClasses;
			updateElementSettings( {
				id: element.id,
				props: { classes },
				withHistory: false,
			} );
		}
	} );
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
