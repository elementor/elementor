import { type Document } from '@elementor/editor-documents';
import { ajax } from '@elementor/editor-v1-adapters';

import { addEmbeddedDocumentStyles, clearEmbeddedDocumentsStyles } from './styles-provider';

export type EmbeddedDocumentLoadCallback = ( documentId: number, data: Document ) => void;

type EmbeddedDocumentLoadListener = EmbeddedDocumentLoadCallback;

const pendingIds = new Set< number >();
const loadedDocuments = new Map< number, Document >();
const listeners = new Set< EmbeddedDocumentLoadListener >();
let currentDocumentId: number | null = null;

export function setCurrentDocumentId( id: number | null ): void {
	currentDocumentId = id;
}

/**
 * Adds post IDs to the manager. Any ID not yet loaded will be fetched;
 * already-loaded posts are skipped without notifying listeners.
 *
 * @param {number[]} ids Post IDs to load.
 */
function addDocuments( ids: number[] ): void {
	const newIds = ids.filter(
		( id ) => ! isCurrentDocument( id ) && ! pendingIds.has( id ) && ! loadedDocuments.has( id )
	);

	newIds.forEach( ( id ) => pendingIds.add( id ) );

	if ( ! newIds.length ) {
		return;
	}

	void fetchAndNotify( newIds );
}

/**
 * Registers a related post that was already fetched.
 *
 * @param {number}   documentId The document / post ID.
 * @param {Document} data       The document data to deliver.
 */
function setDocument( documentId: number, data: Document ): void {
	if ( isCurrentDocument( documentId ) ) {
		return;
	}

	const isNew = ! loadedDocuments.has( documentId );

	loadedDocuments.set( documentId, data );

	if ( isNew ) {
		notifyListeners( documentId, data );
	} else {
		addEmbeddedDocumentStyles( documentId, data );
	}
}

/**
 * Registers a callback that is invoked whenever a related (non-current) post
 * finishes loading. Already-loaded related posts are delivered to the callback
 * asynchronously on subscribe. Returns an unsubscribe function.
 *
 * @param {EmbeddedDocumentLoadCallback} callback Function called with (documentId, data) on each load.
 */
function onDocumentLoad( callback: EmbeddedDocumentLoadCallback ): () => void {
	listeners.add( callback );

	void Promise.resolve().then( () => {
		if ( ! listeners.has( callback ) ) {
			return;
		}

		loadedDocuments.forEach( ( data, documentId ) => {
			if ( ! isCurrentDocument( documentId ) ) {
				callback( documentId, data );
			}
		} );
	} );

	return () => {
		listeners.delete( callback );
	};
}

function reset(): void {
	pendingIds.clear();
	loadedDocuments.clear();
	clearEmbeddedDocumentsStyles();
}

export const embeddedDocumentsManager = {
	addDocuments,
	setDocument,
	onDocumentLoad,
	reset,
};

function isCurrentDocument( documentId: number ): boolean {
	return currentDocumentId !== null && documentId === currentDocumentId;
}

async function fetchAndNotify( ids: number[] ): Promise< void > {
	const results = await Promise.all( ids.map( fetchDocument ) );

	results.forEach( ( result, index ) => {
		const id = ids[ index ];

		if ( ! pendingIds.has( id ) ) {
			return;
		}

		pendingIds.delete( id );

		if ( ! result || isCurrentDocument( id ) ) {
			return;
		}

		const { data } = result;
		loadedDocuments.set( id, data );
		notifyListeners( id, data );
	} );
}

async function fetchDocument( id: number ): Promise< {
	id: number;
	data: Document;
} | null > {
	try {
		const data = await ajax.load< { id: number }, Document >( {
			data: { id },
			action: 'get_document_config',
			unique_id: `embedded-document-${ id }`,
		} );

		return { id, data };
	} catch {
		return null;
	}
}

function notifyListeners( documentId: number, data: Document ): void {
	if ( isCurrentDocument( documentId ) ) {
		return;
	}

	listeners.forEach( ( cb ) => cb( documentId, data ) );
	addEmbeddedDocumentStyles( documentId, data );
}
