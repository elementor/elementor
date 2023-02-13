import { Document, Slice } from '../types';
import { dispatch } from '@elementor/store';
import { normalizeV1Document, getV1DocumentsManager } from './utils';
import {
	commandEndEvent,
	CommandEvent,
	commandStartEvent,
	ListenerEvent,
	listenTo,
	v1ReadyEvent,
} from '@elementor/v1-adapters';

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
				.entries( getV1DocumentsManager().documents )
				.reduce( ( acc: Record<string, Document>, [ id, document ] ) => {
					acc[ id ] = normalizeV1Document( document );

					return acc;
				}, {} );

			dispatch( setDocuments( normalizedDocuments ) );
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
	const { startSaving, endSaving, startSavingDraft, endSavingDraft } = slice.actions;

	const isDraft = ( e: ListenerEvent ) => {
		const event = e as CommandEvent<{ status: string }>;

		/**
		 * @see https://github.com/elementor/elementor/blob/5f815d40a/assets/dev/js/editor/document/save/hooks/ui/save/before.js#L18-L22
		 */
		return event.args?.status === 'autosave';
	};

	listenTo(
		v1ReadyEvent(),
		() => {
			const { isSaving } = getV1DocumentsManager().getCurrent().editor;

			if ( isSaving ) {
				dispatch( startSaving() );
			}
		}
	);

	listenTo(
		commandStartEvent( 'document/save/save' ),
		( e ) => {
			if ( isDraft( e ) ) {
				dispatch( startSavingDraft() );
				return;
			}

			dispatch( startSaving() );
		}
	);

	listenTo(
		commandEndEvent( 'document/save/save' ),
		( e ) => {
			if ( isDraft( e ) ) {
				dispatch( endSavingDraft() );
				return;
			}

			dispatch( endSaving() );
		}
	);
}

function syncOnDocumentChange( slice: Slice ) {
	const { markAsDirty, markAsPristine } = slice.actions;

	listenTo(
		commandEndEvent( 'document/save/set-is-modified' ),
		() => {
			const currentDocument = getV1DocumentsManager().getCurrent();

			if ( currentDocument.editor.isChanged ) {
				dispatch( markAsDirty() );
				return;
			}

			dispatch( markAsPristine() );
		}
	);
}
