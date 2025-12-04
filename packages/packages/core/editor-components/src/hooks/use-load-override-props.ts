import { useEffect } from 'react';
import { __getState as getState, __useDispatch as useDispatch } from '@elementor/store';

import { selectCurrentComponentId, selectOverridableProps, slice } from '../store/store';
import { type OverridableProps } from '../types';
import { apiClient } from '../api';

export const useLoadOverrideProps = () => {
	const dispatch = useDispatch();
	const componentId = selectCurrentComponentId( getState() );
	const componentOverridableProps = componentId ? selectOverridableProps( getState(), componentId ) : undefined;

	useEffect( () => {
		if ( ! componentOverridableProps ) {
			return;
		}

		async function loadOverridableProps() {
			if ( ! componentId ) {
				return;
			}

			const data = await apiClient.getOverrideProps( componentId );

			dispatch( slice.actions.setOverridableProps( { componentId, overridableProps: data as OverridableProps } ) );
		}

		loadOverridableProps();
	}, [ componentId, dispatch ] );
};
