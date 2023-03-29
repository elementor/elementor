import { Slice } from '../store';
import { Document } from '../types';
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
	syncInitialization( slice );
	syncActiveDocument( slice );
	syncOnDocumentSave( slice );
	syncOnDocumentChange( slice );
}

function syncInitialization( slice: Slice ) {
	const { init } = slice.actions;

	listenTo(
		v1ReadyEvent(),
		() => {
			const documentsManager = getV1DocumentsManager();

			const entities = Object.entries( documentsManager.documents )
				.reduce( ( acc: Record<string, Document>, [ id, document ] ) => {
					acc[ id ] = normalizeV1Document( document );

					return acc;
				}, {} );

			dispatch( init( {
				entities,
				hostId: documentsManager.getInitialId(),
				activeId: documentsManager.getCurrentId(),
			} ) );
		}
	);
}

function syncActiveDocument( slice: Slice ) {
	const { activateDocument } = slice.actions;

	listenTo(
		commandEndEvent( 'editor/documents/open' ),
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
			const activeDocument = normalizeV1Document(
				getV1DocumentsManager().getCurrent()
			);

			if ( isDraft( e ) ) {
				dispatch( endSavingDraft( activeDocument ) );
			} else {
				dispatch( endSaving( activeDocument ) );
			}
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
