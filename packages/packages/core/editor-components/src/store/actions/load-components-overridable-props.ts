import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { apiClient } from '../../api';
import { selectIsOverridablePropsLoaded, slice } from '../store';

export async function loadComponentsOverridableProps( componentIds: number[] ) {
	const unloadedIds = componentIds.filter( ( id ) => ! selectIsOverridablePropsLoaded( getState(), id ) );

	if ( ! unloadedIds.length ) {
		return;
	}

	const { data } = await apiClient.getOverridableProps( unloadedIds );

	componentIds.forEach( ( componentId ) => {
		if ( ! data[ componentId ] ) {
			return;
		}

		dispatch(
			slice.actions.setOverridableProps( {
				componentId,
				overridableProps: data[ componentId ],
			} )
		);
	} );
}
