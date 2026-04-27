import { getCurrentDocument, getV1DocumentsManager } from '@elementor/editor-documents';
import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';

/**
 * Used when leaving surfaces that require the document to refresh (e.g. after global class changes).
 */
export function reloadCurrentDocument() {
	const currentDocument = getCurrentDocument();
	const documentsManager = getV1DocumentsManager();

	documentsManager.invalidateCache();

	return runCommand( 'editor/documents/switch', {
		id: currentDocument?.id,
		shouldScroll: false,
		shouldNavigateToDefaultRoute: false,
	} );
}
