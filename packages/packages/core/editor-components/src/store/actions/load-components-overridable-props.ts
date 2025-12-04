import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { apiClient } from '../../api';
import { DEFAULT_OVERRIDABLE_PROPS, selectIsOverridablePropsLoaded, slice } from '../store';

export function loadComponentsOverridableProps( componentIds: number[] ) {
	if ( ! componentIds.length ) {
		return;
	}

	componentIds.forEach( loadComponentOverrides );
}

async function loadComponentOverrides( componentId: number ) {
	const isOverridablePropsLoaded = selectIsOverridablePropsLoaded( getState(), componentId );

	if ( isOverridablePropsLoaded ) {
		return;
	}

	const overridableProps = await apiClient.getOverridableProps( componentId );

	dispatch(
		slice.actions.setOverridableProps( {
			componentId,
			overridableProps: overridableProps ?? DEFAULT_OVERRIDABLE_PROPS,
		} )
	);
}
