import { type Document } from '@elementor/editor-documents';
import { ajax } from '@elementor/editor-v1-adapters';

import { addPostStyles, clearStyles } from './styles-provider';

export type RelatedPostLoadCallback = ( postId: number, data: Document ) => void;

type RelatedPostLoadListener = RelatedPostLoadCallback;

const pendingIds = new Set< number >();
const loadedPosts = new Map< number, Document >();
const listeners = new Set< RelatedPostLoadListener >();
let currentDocumentId: number | null = null;

export function setCurrentDocumentId( id: number | null ): void {
	currentDocumentId = id;
}

function isCurrentDocument( postId: number ): boolean {
	return currentDocumentId !== null && postId === currentDocumentId;
}

/**
 * Adds post IDs to the manager. Any ID not yet loaded will be fetched;
 * already-loaded posts are skipped without notifying listeners.
 *
 * @param {number[]} ids Post IDs to load.
 */
export function addPosts( ids: number[] ): void {
	const newIds = ids.filter( ( id ) => ! pendingIds.has( id ) && ! loadedPosts.has( id ) );

	newIds.forEach( ( id ) => pendingIds.add( id ) );

	if ( ! newIds.length ) {
		return;
	}

	void fetchAndNotify( newIds );
}

/**
 * Registers a callback that is invoked whenever a related (non-current) post
 * finishes loading. Already-loaded related posts are delivered to the callback
 * asynchronously on subscribe. Returns an unsubscribe function.
 *
 * @param {RelatedPostLoadCallback} callback Function called with (postId, data) on each load.
 */
export function onRelatedPostLoad( callback: RelatedPostLoadCallback ): () => void {
	listeners.add( callback );

	void Promise.resolve().then( () => {
		if ( ! listeners.has( callback ) ) {
			return;
		}

		loadedPosts.forEach( ( data, postId ) => {
			if ( ! isCurrentDocument( postId ) ) {
				callback( postId, data );
			}
		} );
	} );

	return () => {
		listeners.delete( callback );
	};
}

/**
 * Resets transient state (pending queue, loaded post cache, and styles) before
 * a new preview cycle. Permanent listeners registered via onRelatedPostLoad are
 * preserved so consumers registered at init() time survive across
 * attach-preview calls.
 */
export function reset(): void {
	pendingIds.clear();
	loadedPosts.clear();
	clearStyles();
}

/**
 * Registers a related post that was already fetched. Does not notify listeners
 * when the post is the current document.
 *
 * @param {number}   postId The document / post ID.
 * @param {Document} data   The document data to deliver.
 */
export function announcePost( postId: number, data: Document ): void {
	if ( isCurrentDocument( postId ) ) {
		return;
	}

	const isNew = ! loadedPosts.has( postId );

	loadedPosts.set( postId, data );

	if ( isNew ) {
		notifyRelatedListeners( postId, data );
	} else {
		addPostStyles( postId, data );
	}
}

async function fetchAndNotify( ids: number[] ): Promise< void > {
	const results = await Promise.all( ids.map( fetchDocument ) );

	results.forEach( ( result ) => {
		if ( ! result ) {
			return;
		}

		const { id, data } = result;

		pendingIds.delete( id );
		loadedPosts.set( id, data );
		notifyRelatedListeners( id, data );
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
			unique_id: `related-post-${ id }`,
		} );

		return { id, data };
	} catch {
		return null;
	}
}

function notifyRelatedListeners( postId: number, data: Document ): void {
	if ( isCurrentDocument( postId ) ) {
		return;
	}

	listeners.forEach( ( cb ) => cb( postId, data ) );
	addPostStyles( postId, data );
}
