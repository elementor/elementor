import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { apiClient } from '../../api';
import { selectIsOverridablePropsLoaded, slice } from '../store';

export function loadComponentsOverridableProps( componentIds: number[] ) {
	if ( ! componentIds.length ) {
		return;
	}

	return Promise.all( componentIds.map( loadComponentOverrides ) );
}

async function loadComponentOverrides( componentId: number ) {
	const isOverridablePropsLoaded = selectIsOverridablePropsLoaded( getState(), componentId );

	if ( isOverridablePropsLoaded ) {
		return;
	}

	const overridableProps = await apiClient.getOverridableProps( componentId );

	if ( ! overridableProps ) {
		return;
	}

	dispatch(
		slice.actions.setOverridableProps( {
			componentId,
			overridableProps,
		} )
	);
}
