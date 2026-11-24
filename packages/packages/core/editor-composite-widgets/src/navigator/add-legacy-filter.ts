import { __privateListenTo as listenTo, v1ReadyEvent } from '@elementor/editor-v1-adapters';

import { type LegacyFilter, type WindowWithHooks } from './types';

export function addLegacyFilter< T >( name: string, callback: LegacyFilter< T > ) {
	// The Structure panel may render its rows before v1 is ready, so register as early as the hooks exist.
	if ( tryAddFilter( name, callback ) ) {
		return;
	}

	listenTo( v1ReadyEvent(), () => {
		tryAddFilter( name, callback );
	} );
}

function tryAddFilter< T >( name: string, callback: LegacyFilter< T > ): boolean {
	const hooks = ( window as unknown as WindowWithHooks ).elementor?.hooks;

	if ( ! hooks?.addFilter ) {
		return false;
	}

	hooks.addFilter( name, callback );

	return true;
}
