import { getCurrentDocument, getV1DocumentsManager } from '@elementor/editor-documents';
import { trackGlobalClassEvent } from '@elementor/editor-editing-panel';
import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';
import { __dispatch as dispatch } from '@elementor/store';

import { fetchCssClassUsage } from '../../../service/css-class-usage-service';
import { slice } from '../../store';

let isDeleted = false;

const trackDeleteClass = async ( id: string, label: string ) => {
	const cssClassUsage = await fetchCssClassUsage();
	trackGlobalClassEvent( {
		event: 'classManagerDelete',
		classId: id,
		classTitle: label,
		source: 'class-manager',
		totalInstances: cssClassUsage[ id ]?.total ?? 0,
	} );
};

export const deleteClass = async ( id: string, label: string ) => {
	dispatch( slice.actions.delete( id ) );
	await trackDeleteClass( id, label );
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
