import { useEffect } from 'react';
import { getV1CurrentDocument } from '@elementor/editor-documents';
import { __getState as getState, __useDispatch as useDispatch } from '@elementor/store';

import { selectOverridableProps, slice } from '../store/store';
import { type OverridableProps } from '../types';
import { apiClient } from '../api';

export const useLoadOverrideProps = () => {
	const currentDocument = getV1CurrentDocument();
	const componentId = currentDocument?.id;
	const dispatch = useDispatch();
	const componentOverridableProps = selectOverridableProps( getState(), componentId );

	useEffect( () => {
		if ( ! componentId ) {
			return;
		}

		async function loadOverridableProps() {
			const data = await apiClient.getOverrideProps( componentId );

			dispatch( slice.actions.setOverridableProps( { componentId, overridableProps: data as OverridableProps } ) );
		}

		if ( componentOverridableProps ) {
			return;
		}

		loadOverridableProps();
	}, [ componentId, dispatch ] );
};
