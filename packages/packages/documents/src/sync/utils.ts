import { Document, ExtendedWindow, V1Document } from '../';

export function getV1DocumentsManager() {
	const documentsManager = ( window as unknown as ExtendedWindow ).elementor?.documents;

	if ( ! documentsManager ) {
		throw new Error( 'Elementor Editor V1 documents manager not found' );
	}

	return documentsManager;
}

export function normalizeV1Document( documentData: V1Document ): Document {
	// TODO: See: https://github.com/elementor/elementor/blob/e86b957a2/assets/dev/js/editor/document/save/behaviors/footer-saver.js#L96-L101
	const status = documentData.container.settings.get( 'post_status' ) ?? 'pending';

	// Draft or autosave.
	const isUnpublishedRevision = documentData.config.revisions.current_id !== documentData.id;

	return {
		id: documentData.id,
		title: documentData.container.settings.get( 'post_title' ),
		status,
		type: documentData.config.type,
		isDirty: documentData.editor.isChanged || isUnpublishedRevision,
		isSaving: documentData.editor.isSaving,
		isSavingDraft: false,
		userCan: {
			publish: documentData.config.user.can_publish,
		},
	};
}
