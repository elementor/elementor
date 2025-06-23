import { __privateRunCommandSync as runCommandSync } from '@elementor/editor-v1-adapters';

import { type Document, type ExtendedWindow, type V1Document } from '../types';

export function getV1DocumentsManager() {
	const documentsManager = ( window as unknown as ExtendedWindow ).elementor?.documents;

	if ( ! documentsManager ) {
		throw new Error( 'Elementor Editor V1 documents manager not found' );
	}

	return documentsManager;
}

export function getV1DocumentsExitTo( documentData: V1Document ) {
	const exitPreference =
		( window as unknown as ExtendedWindow ).elementor?.getPreferences?.( 'exit_to' ) || 'this_post';

	switch ( exitPreference ) {
		case 'dashboard':
			return documentData.config.urls.main_dashboard;

		case 'all_posts':
			return documentData.config.urls.all_post_type;

		case 'this_post':
		default:
			return documentData.config.urls.exit_to_dashboard;
	}
}

function getV1DocumentShowCopyAndShare( documentData: V1Document | null ) {
	return documentData?.config?.panel?.show_copy_and_share ?? false;
}

export function getV1DocumentPermalink( documentData: V1Document ) {
	return documentData.config.urls.permalink ?? '';
}

export function normalizeV1Document( documentData: V1Document ): Document {
	// Draft or autosave.
	const isUnpublishedRevision = documentData.config.revisions.current_id !== documentData.id;
	const exitToUrl = getV1DocumentsExitTo( documentData );

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
		links: {
			permalink: getV1DocumentPermalink( documentData ),
			platformEdit: exitToUrl,
		},
		isDirty: documentData.editor.isChanged || isUnpublishedRevision,
		isSaving: documentData.editor.isSaving,
		isSavingDraft: false,
		permissions: {
			allowAddingWidgets: documentData.config.panel?.allow_adding_widgets ?? true,
			showCopyAndShare: getV1DocumentShowCopyAndShare( documentData ),
		},
		userCan: {
			publish: documentData.config.user.can_publish,
		},
	};
}

export function setDocumentModifiedStatus( status: boolean ) {
	runCommandSync( 'document/save/set-is-modified', { status }, { internal: true } );
}
