import { Document, ExtendedWindow, V1Document } from '../types';

export function getV1DocumentsManager() {
	const documentsManager = ( window as unknown as ExtendedWindow ).elementor?.documents;

	if ( ! documentsManager ) {
		throw new Error( 'Elementor Editor V1 documents manager not found' );
	}

	return documentsManager;
}

export function normalizeV1Document( documentData: V1Document ): Document {
	// Draft or autosave.
	const isUnpublishedRevision = documentData.config.revisions.current_id !== documentData.id;

	return {
		id: documentData.id,
		title: documentData.container.settings.get( 'post_title' ),
		type: {
			value: documentData.config.type,
			label: documentData.config.panel.title,
		},
		status: {
			value: documentData.config.status.value,
			label: documentData.config.status.label,
		},
		isDirty: documentData.editor.isChanged || isUnpublishedRevision,
		isSaving: documentData.editor.isSaving,
		isSavingDraft: false,
		userCan: {
			publish: documentData.config.user.can_publish,
		},
	};
}
