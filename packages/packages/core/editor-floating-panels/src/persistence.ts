import { type FloatingPanelState } from './types';

export const PERSISTENCE_STORAGE_KEY = 'elementor_floating_panels_state';

type PersistedState = Record< string, FloatingPanelState >;

export function encodePersistedState( state: PersistedState ): string {
	return JSON.stringify( state );
}

export function decodePersistedState( raw: string | null | undefined ): PersistedState {
	if ( ! raw ) {
		return {};
	}

	let parsed: unknown;

	try {
		parsed = JSON.parse( raw );
	} catch {
		return {};
	}

	if ( typeof parsed !== 'object' || parsed === null ) {
		return {};
	}

	const result: PersistedState = {};

	for ( const [ id, value ] of Object.entries( parsed as Record< string, unknown > ) ) {
		if ( isPanelState( value ) ) {
			result[ id ] = value;
		}
	}

	return result;
}

function isPanelState( value: unknown ): value is FloatingPanelState {
	if ( typeof value !== 'object' || value === null ) {
		return false;
	}

	const v = value as Record< string, unknown >;

	return (
		typeof v.isOpen === 'boolean' &&
		typeof v.position === 'object' &&
		v.position !== null &&
		typeof v.size === 'object' &&
		v.size !== null &&
		typeof v.zIndex === 'number'
	);
}
