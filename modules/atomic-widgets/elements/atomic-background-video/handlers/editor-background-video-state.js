import { Alpine } from '@elementor/alpinejs';

const STORE_NAME = 'editor-background-video-state';
const PLAYING_STATE = 'playing';
const PAUSED_STATE = 'paused';

/**
 * @typedef {Record<string, 'playing' | 'paused' | ''>} BackgroundVideoState
 */

function ensureStore() {
	if ( ! Alpine.store( STORE_NAME ) ) {
		Alpine.store( STORE_NAME, /** @type {BackgroundVideoState} */ ( {} ) );
	}

	return /** @type {BackgroundVideoState} */ ( Alpine.store( STORE_NAME ) );
}

export function resolveDesignTimeState( state, fallback = PLAYING_STATE ) {
	if ( PLAYING_STATE === state || PAUSED_STATE === state ) {
		return state;
	}

	if ( '' === state ) {
		return '';
	}

	return fallback;
}

export function getEditorState( elementId, fallback = PLAYING_STATE ) {
	const store = ensureStore();

	return store[ elementId ] ?? fallback;
}

export function setEditorState( elementId, state ) {
	const store = ensureStore();

	store[ elementId ] = state;
}

export function isEditorPreview() {
	return Boolean( window.elementorFrontend?.isEditMode?.() || window.parent?.elementor );
}
