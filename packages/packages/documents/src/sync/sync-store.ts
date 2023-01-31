import { Document, Slice } from '../types';
import { dispatch } from '@elementor/store';
import { normalizeV1Document, getV1DocumentsManager } from './utils';
import { commandEndEvent, CommandEvent, commandStartEvent, listenTo, v1ReadyEvent } from '@elementor/v1-adapters';

export function syncStore( slice: Slice ) {
	syncDocuments( slice );
	syncCurrentDocument( slice );
	syncOnDocumentSave( slice );
	syncOnDocumentChange( slice );
}

function syncDocuments( slice: Slice ) {
	const { loadDocuments } = slice.actions;

	listenTo(
		v1ReadyEvent(),
		() => {
			const normalizedDocuments = Object
				.entries( getV1DocumentsManager().documents )
				.reduce( ( acc: Record<string, Document>, [ id, document ] ) => {
					acc[ id ] = normalizeV1Document( document );

					return acc;
				}, {} );

			dispatch( loadDocuments( normalizedDocuments ) );
		}
	);
}

function syncCurrentDocument( slice: Slice ) {
	const { activateDocument } = slice.actions;

	listenTo(
		[
			v1ReadyEvent(),
			commandEndEvent( 'editor/documents/open' ),
		],
		() => {
			const documentsManager = getV1DocumentsManager();
			const currentDocument = normalizeV1Document( documentsManager.getCurrent() );

			dispatch( activateDocument( currentDocument ) );
		}
	);
}

function syncOnDocumentSave( slice: Slice ) {
	const { toggleIsSaving, toggleIsSavingDraft } = slice.actions;

	listenTo(
		v1ReadyEvent(),
		() => {
			const { isSaving } = getV1DocumentsManager().getCurrent().editor;

			dispatch( toggleIsSaving( isSaving ) );
		}
	);

	listenTo(
		commandStartEvent( 'document/save/save' ),
		( e ) => {
			const event = e as CommandEvent<{ status: string }>;

			/**
			 * @see https://github.com/elementor/elementor/blob/5f815d40a/assets/dev/js/editor/document/save/hooks/ui/save/before.js#L18-L22
			 */
			if ( event.args?.status === 'autosave' ) {
				dispatch( toggleIsSavingDraft( true ) );
			} else {
				dispatch( toggleIsSaving( true ) );
			}
		}
	);

	listenTo(
		commandEndEvent( 'document/save/save' ),
		( e ) => {
			const event = e as CommandEvent<{ status: string }>;

			if ( event.args?.status === 'autosave' ) {
				dispatch( toggleIsSavingDraft( false ) );
			} else {
				dispatch( toggleIsSaving( false ) );
			}
		}
	);
}

function syncOnDocumentChange( slice: Slice ) {
	const { markAsDirty } = slice.actions;

	listenTo(
		v1ReadyEvent(),
		() => {
			const currentDocument = getV1DocumentsManager().getCurrent();
			const isAutoSave = currentDocument.config.revisions.current_id !== currentDocument.id;

			dispatch( markAsDirty( isAutoSave ) );
		}
	);

	listenTo(
		commandEndEvent( 'document/save/set-is-modified' ),
		() => {
			const currentDocument = getV1DocumentsManager().getCurrent();

			dispatch( markAsDirty( currentDocument.editor.isChanged ) );
		}
	);
}
