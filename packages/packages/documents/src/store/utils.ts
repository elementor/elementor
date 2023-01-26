import { Document, ExtendedWindow, V1Document } from '../';

export function getDocumentsManager() {
	const documentsManager = ( window as unknown as ExtendedWindow ).elementor?.documents;

	if ( ! documentsManager ) {
		throw new Error( 'Elementor Editor V1 documents manager not found' );
	}

	return documentsManager;
}

export function normalizeV1Document( documentData: V1Document ): Document {
	return {
		id: documentData.id,
		title: documentData.container.settings.get( 'post_title' ),
		status: documentData.container.settings.get( 'post_status' ),
		isModified: documentData.editor.isChanged,
		isSaving: documentData.editor.isSaving,
		isSavingDraft: false, // TODO: Is this OK? Can we get any real state?
		userCan: {
			publish: documentData.config.user.can_publish,
		},
	};
}
