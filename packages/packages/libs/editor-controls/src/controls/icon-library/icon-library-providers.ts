import { useState } from 'react';
import { useQuery } from '@elementor/query';

import { type FontAwesome7Icon } from './font-awesome-7-catalog';

export type IconLibraryProviderState = {
	data?: FontAwesome7Icon[];
	isLoading: boolean;
};

export type IconLibraryProvider = {
	id: string;
	useIcons: ( enabled: boolean ) => IconLibraryProviderState;
	resolveSvg?: ( library: string, iconValue: string, signal?: AbortSignal ) => Promise< string | null >;
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

	return {
		data: states.flatMap( ( state ) => state.data ?? [] ),
		isLoading: states.some( ( state ) => state.isLoading ),
	};
}

export async function resolveProviderIconSvg(
	library: string,
	iconValue: string,
	signal?: AbortSignal
): Promise< string | null > {
	for ( const provider of providers.values() ) {
		try {
			const markup = await provider.resolveSvg?.( library, iconValue, signal );

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

export function useProviderIconSvg( library: string | null, iconValue: string | null, enabled: boolean ) {
	return useQuery< string | null >( {
		queryKey: [ 'icon-library-provider-svg', library, iconValue ],
		queryFn: ( { signal } ) => resolveProviderIconSvg( library as string, iconValue as string, signal ),
		enabled: enabled && Boolean( library && iconValue ),
		staleTime: Infinity,
	} );
}
