import { type ExtendedWindow } from '@elementor/editor-documents';
import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';

function getV1DocumentsManager() {
	const documentsManager = ( window as unknown as ExtendedWindow ).elementor?.documents;

	if ( ! documentsManager ) {
		throw new Error( 'Elementor Editor V1 documents manager not found' );
	}

	return documentsManager;
}

export default function useRenameActiveDocument() {
	return async ( title: string ) => {
		const currentDocument = getV1DocumentsManager().getCurrent();
		const container = currentDocument.container;
		await runCommand( 'document/elements/settings', {
			container,
			settings: { post_title: title },
		} );
	};
}
