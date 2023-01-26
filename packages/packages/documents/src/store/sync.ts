import { Document, Slice } from '../types';
import { dispatch } from '@elementor/store';
import { normalizeV1Document, getDocumentsManager } from './utils';
import { commandEndEvent, CommandEvent, commandStartEvent, listenTo, v1ReadyEvent } from '@elementor/v1-adapters';

export function syncStore( slice: Slice ) {
	syncDocuments( slice );
	syncCurrentDocument( slice );
	syncOnDocumentSave( slice );
	syncOnDocumentChange( slice );
}

function syncDocuments( slice: Slice ) {
	const { setDocuments } = slice.actions;

	listenTo(
		v1ReadyEvent(),
		() => {
			const normalizedDocuments = Object
				.entries( getDocumentsManager().documents )
				.reduce( ( acc: Record<string, Document>, [ id, document ] ) => {
					acc[ id ] = normalizeV1Document( document );

					return acc;
				}, {} );

			dispatch( setDocuments( normalizedDocuments ) );
		}
	);
}

function syncCurrentDocument( slice: Slice ) {
	const { setCurrentDocumentId, addDocument } = slice.actions;

	listenTo(
		[
			v1ReadyEvent(),
			commandEndEvent( 'editor/documents/open' ),
		],
		() => {
			const documentsManager = getDocumentsManager();

			dispatch( setCurrentDocumentId( documentsManager.getCurrentId() ) );
			dispatch( addDocument( normalizeV1Document( documentsManager.getCurrent() ) ) );
		}
	);
}

function syncOnDocumentSave( slice: Slice ) {
	const { updateDocument } = slice.actions;

	const setIsSaving = ( isSaving: boolean ) => {
		const id = getDocumentsManager().getCurrentId();

		dispatch( updateDocument( {
			id,
			isSaving,
		} ) );
	};

	const setIsSavingDraft = ( isSavingDraft: boolean ) => {
		const id = getDocumentsManager().getCurrentId();

		dispatch( updateDocument( {
			id,
			isSavingDraft,
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
		( e ) => {
			const event = e as CommandEvent<{ status: string }>;

			/**
			 * @see https://github.com/elementor/elementor/blob/5f815d40a/assets/dev/js/editor/document/save/hooks/ui/save/before.js
			 */
			if ( event.args?.status === 'autosave' ) {
				setIsSavingDraft( true );
			} else {
				setIsSaving( true );
			}
		}
	);

	listenTo(
		commandEndEvent( 'document/save/save' ),
		( e ) => {
			const event = e as CommandEvent<{ status: string }>;

			if ( event.args.status === 'autosave' ) {
				setIsSavingDraft( false );
			} else {
				setIsSaving( false );
			}
		}
	);
}

function syncOnDocumentChange( slice: Slice ) {
	const { updateDocument } = slice.actions;

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
			const currentDocument = getDocumentsManager().getCurrent();
			const isAutoSave = currentDocument.config.revisions.current_id !== currentDocument.id;

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
