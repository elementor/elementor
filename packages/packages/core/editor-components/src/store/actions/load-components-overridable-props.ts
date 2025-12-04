import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { apiClient } from '../../api';
import { selectIsOverridablePropsLoaded, slice } from '../store';

export async function loadComponentsOverridableProps( componentIds: number[] ) {
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

	const overridableProps = await apiClient.getOverrideProps( componentId );

	dispatch( slice.actions.setOverridableProps( { componentId, overridableProps } ) );
}
