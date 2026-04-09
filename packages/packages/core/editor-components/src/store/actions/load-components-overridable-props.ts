import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { apiClient } from '../../api';
import { selectIsOverridablePropsLoaded, slice } from '../store';

export async function loadComponentsOverridableProps( componentIds: number[] ) {
	const unloadedIds = componentIds.filter( ( id ) => ! selectIsOverridablePropsLoaded( getState(), id ) );

	if ( ! unloadedIds.length ) {
		return;
	}

	const { data, meta } = await apiClient.getOverridableProps( unloadedIds );

	for ( const [ componentId, overridableProps ] of Object.entries( data ) ) {
		if ( ! overridableProps ) {
			continue;
		}

		dispatch(
			slice.actions.setOverridableProps( {
				componentId: Number( componentId ),
				overridableProps,
			} )
		);
	}

	if ( meta?.errors && Object.keys( meta.errors ).length ) {
		throw new Error( `Failed to load overridable props for some components: ${ JSON.stringify( meta.errors ) }` );
	}
}
