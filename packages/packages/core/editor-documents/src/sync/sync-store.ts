import {
	__privateListenTo as listenTo,
	commandEndEvent,
	type CommandEvent,
	commandStartEvent,
	type ListenerEvent,
	v1ReadyEvent,
} from '@elementor/editor-v1-adapters';
import { __dispatch, __getState as getState } from '@elementor/store';
import { debounce } from '@elementor/utils';

import { slice } from '../store';
import { selectActiveDocument } from '../store/selectors';
import { type Document } from '../types';
import { getV1DocumentPermalink, getV1DocumentsExitTo, getV1DocumentsManager, normalizeV1Document } from './utils';

export function syncStore() {
	syncInitialization();
	syncActiveDocument();
	syncOnDocumentSave();
	syncOnTitleChange();
	syncOnDocumentChange();
	syncOnExitToChange();
}

function syncInitialization() {
	const { init } = slice.actions;

	listenTo( v1ReadyEvent(), () => {
		const documentsManager = getV1DocumentsManager();

		const entities = Object.entries( documentsManager.documents ).reduce(
			( acc: Record< string, Document >, [ id, document ] ) => {
				acc[ id ] = normalizeV1Document( document );

				return acc;
			},
			{}
		);

		__dispatch(
			init( {
				entities,
				hostId: documentsManager.getInitialId(),
				activeId: documentsManager.getCurrentId(),
			} )
		);
	} );
}

function syncActiveDocument() {
	const { activateDocument, setAsHost } = slice.actions;

	listenTo( commandEndEvent( 'editor/documents/open' ), () => {
		const documentsManager = getV1DocumentsManager();
		const currentDocument = normalizeV1Document( documentsManager.getCurrent() );

		__dispatch( activateDocument( currentDocument ) );

		if ( documentsManager.getInitialId() === currentDocument.id ) {
			__dispatch( setAsHost( currentDocument.id ) );
		}
	} );
}

function syncOnDocumentSave() {
	const { startSaving, endSaving, startSavingDraft, endSavingDraft } = slice.actions;

	const isDraft = ( e: ListenerEvent ) => {
		const event = e as CommandEvent< { status: string } >;

		/**
		 * @see https://github.com/elementor/elementor/blob/5f815d40a/assets/dev/js/editor/document/save/hooks/ui/save/before.js#L18-L22
		 */
		return event.args?.status === 'autosave';
	};

	listenTo( commandStartEvent( 'document/save/save' ), ( e ) => {
		if ( isDraft( e ) ) {
			__dispatch( startSavingDraft() );
			return;
		}

		__dispatch( startSaving() );
	} );

	listenTo( commandEndEvent( 'document/save/save' ), ( e ) => {
		const activeDocument = normalizeV1Document( getV1DocumentsManager().getCurrent() );

		if ( isDraft( e ) ) {
			__dispatch( endSavingDraft( activeDocument ) );
		} else {
			__dispatch( endSaving( activeDocument ) );
		}
	} );
}

function syncOnTitleChange() {
	const { updateActiveDocument } = slice.actions;

	const updateTitle = debounce( ( e: ListenerEvent ) => {
		const event = e as CommandEvent< { settings: { post_title?: string } } >;

		if ( ! ( 'post_title' in event.args?.settings ) ) {
			return;
		}

		const currentDocument = getV1DocumentsManager().getCurrent();
		const newTitle = currentDocument.container.settings.get( 'post_title' );

		__dispatch( updateActiveDocument( { title: newTitle } ) );
	}, 400 );

	listenTo( commandEndEvent( 'document/elements/settings' ), updateTitle );
}

function syncOnExitToChange() {
	const { updateActiveDocument } = slice.actions;

	const updateExitTo = debounce( ( e: ListenerEvent ) => {
		const event = e as CommandEvent< { settings: { exit_to?: string } } >;

		if ( ! ( 'exit_to' in event.args?.settings ) ) {
			return;
		}

		const currentDocument = getV1DocumentsManager().getCurrent();
		const newExitTo = getV1DocumentsExitTo( currentDocument );
		const permalink = getV1DocumentPermalink( currentDocument );

		__dispatch( updateActiveDocument( { links: { platformEdit: newExitTo, permalink } } ) );
	}, 400 );

	listenTo( commandEndEvent( 'document/elements/settings' ), updateExitTo );
}

function syncOnDocumentChange() {
	const { markAsDirty, markAsPristine } = slice.actions;

	listenTo( commandEndEvent( 'document/save/set-is-modified' ), () => {
		// Skip the dirtiness check if the document is currently being saved, to prevent the UI
		// from showing a disabled publish button while there is a save process. The state will
		// be updated when the save process ends and the whole document state it normalized
		// (see `syncOnDocumentSave`)
		const isSaving = selectActiveDocument( getState() )?.isSaving;

		if ( isSaving ) {
			return;
		}

		const currentDocument = getV1DocumentsManager().getCurrent();

		if ( currentDocument.editor.isChanged ) {
			__dispatch( markAsDirty() );
			return;
		}

		__dispatch( markAsPristine() );
	} );
}
