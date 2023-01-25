import { slice } from './store';
import { dispatch } from '@elementor/store';
import { fromV1Document, getDocumentsManager, mapWithKeys } from './utils';
import { commandEndEvent, commandStartEvent, listenTo, v1ReadyEvent } from '@elementor/v1-adapters';

const {
	setDocuments,
	setCurrentDocumentId,
	addDocument,
	updateDocument,
} = slice.actions;

syncDocuments();
syncCurrentDocument();
syncOnDocumentSave();
syncOnDocumentChange();

function syncDocuments() {
	listenTo(
		v1ReadyEvent(),
		() => {
			const documents = mapWithKeys(
				getDocumentsManager().documents,
				( [ documentId, documentData ] ) => {
					return [ documentId, fromV1Document( documentData ) ];
				}
			);

			dispatch( setDocuments( documents ) );
		}
	);
}

function syncCurrentDocument() {
	listenTo(
		[
			v1ReadyEvent(),
			commandEndEvent( 'editor/documents/open' ),
		],
		() => {
			const documentsManager = getDocumentsManager();

			dispatch( setCurrentDocumentId( documentsManager.getCurrentId() ) );
			dispatch( addDocument( fromV1Document( documentsManager.getCurrent() ) ) );
		}
	);
}

function syncOnDocumentSave() {
	const setIsSaving = ( isSaving: boolean ) => {
		const id = getDocumentsManager().getCurrentId();

		dispatch( updateDocument( {
			id,
			isSaving,
		} ) );
	};

	listenTo(
		v1ReadyEvent(),
		() => {
			const { isSaving } = getDocumentsManager().getCurrent().editor;

			setIsSaving( isSaving );
		}
	);

	listenTo(
		commandStartEvent( 'document/save/save' ),
		() => setIsSaving( true )
	);

	listenTo(
		commandEndEvent( 'document/save/save' ),
		() => setIsSaving( false )
	);
}

function syncOnDocumentChange() {
	const setIsModified = ( isModified: boolean ) => {
		const id = getDocumentsManager().getCurrentId();

		dispatch( updateDocument( {
			id,
			isModified,
		} ) );
	};

	listenTo(
		v1ReadyEvent(),
		() => {
			const currentDocument = getDocumentsManager().getCurrent(),
				isAutoSave = currentDocument.config.revisions.current_id !== currentDocument.id;

			setIsModified( isAutoSave );
		}
	);

	listenTo(
		commandEndEvent( 'document/save/set-is-modified' ),
		() => {
			const currentDocument = getDocumentsManager().getCurrent();

			setIsModified( currentDocument.editor.isChanged );
		}
	);
}
