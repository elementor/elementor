import { useRef, useState } from 'react';

import { type FontAwesome7Icon } from './font-awesome-7-catalog';

export type IconLibraryProviderState = {
	data?: FontAwesome7Icon[];
	isLoading: boolean;
};

export type IconLibraryProvider = {
	id: string;
	useIcons: ( enabled: boolean ) => IconLibraryProviderState;
	resolveSvg?: ( library: string, iconValue: string, signal?: AbortSignal ) => Promise< string | null >;
	/**
	 * Resolves markup for picker tiles and the control preview. Falls back to `resolveSvg` when omitted.
	 * Use it when `resolveSvg` has side effects that should only happen for icons that are actually rendered.
	 */
	resolvePreviewSvg?: ( library: string, iconValue: string, signal?: AbortSignal ) => Promise< string | null >;
};

const providers = new Map< string, IconLibraryProvider >();

/**
 * Register before the icon picker mounts. Each picker instance snapshots the providers on mount,
 * so its hook count stays constant; a provider registered later appears on the next mount.
 * @param provider
 */
export function registerIconLibraryProvider( provider: IconLibraryProvider ) {
	providers.set( provider.id, provider );
}

export function unregisterIconLibraryProvider( id: string ) {
	providers.delete( id );
}

export function useIconLibraryProviderIcons( enabled: boolean ): Required< IconLibraryProviderState > {
	const [ snapshot ] = useState( () => [ ...providers.values() ] );
	const states = snapshot.map( ( provider ) => provider.useIcons( enabled ) );

	const data = useStableConcat( states.map( ( state ) => state.data ) );

	return {
		data,
		isLoading: states.some( ( state ) => state.isLoading ),
	};
}

export function resolveProviderIconSvg(
	library: string,
	iconValue: string,
	signal?: AbortSignal
): Promise< string | null > {
	return resolveFromProviders( ( provider ) => provider.resolveSvg, library, iconValue, signal );
}

export function resolveProviderIconPreviewSvg(
	library: string,
	iconValue: string,
	signal?: AbortSignal
): Promise< string | null > {
	return resolveFromProviders(
		( provider ) => provider.resolvePreviewSvg ?? provider.resolveSvg,
		library,
		iconValue,
		signal
	);
}

async function resolveFromProviders(
	pickResolver: ( provider: IconLibraryProvider ) => IconLibraryProvider[ 'resolveSvg' ],
	library: string,
	iconValue: string,
	signal?: AbortSignal
): Promise< string | null > {
	for ( const provider of providers.values() ) {
		try {
			const markup = await pickResolver( provider )?.( library, iconValue, signal );

			if ( markup ) {
				return markup;
			}
		} catch ( error ) {
			if ( signal?.aborted ) {
				throw error;
			}
		}
	}

	return null;
}

// Keeps the merged array identity while every provider returns the same data reference, so downstream memos hold.
function useStableConcat( lists: Array< FontAwesome7Icon[] | undefined > ): FontAwesome7Icon[] {
	const previous = useRef< { lists: typeof lists; merged: FontAwesome7Icon[] } | null >( null );

	if ( ! previous.current || ! areSameLists( previous.current.lists, lists ) ) {
		previous.current = { lists, merged: lists.flatMap( ( list ) => list ?? [] ) };
	}

	return previous.current.merged;
}

function areSameLists( a: Array< unknown >, b: Array< unknown > ) {
	return a.length === b.length && a.every( ( item, index ) => item === b[ index ] );
}
