import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { apiClient } from '../../api';
import { selectIsOverridablePropsLoaded, slice } from '../store';

type Options = {
	// Bypasses the "already loaded" guard, forcing a re-fetch for the given ids.
	// Used when we know the cached data may be stale (e.g. entering a component's edit mode),
	// since other users may have changed the component's overridable props during the session.
	force?: boolean;
};

export async function loadComponentsOverridableProps( componentIds: number[], { force = false }: Options = {} ) {
	const idsToLoad = force
		? componentIds
		: componentIds.filter( ( id ) => ! selectIsOverridablePropsLoaded( getState(), id ) );

	if ( ! idsToLoad.length ) {
		return;
	}

	const { data } = await apiClient.getOverridableProps( idsToLoad );

	dispatch( slice.actions.loadOverridableProps( data ) );
}
