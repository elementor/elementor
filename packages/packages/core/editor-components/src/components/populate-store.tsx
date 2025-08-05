import { useEffect } from 'react';
import { __useDispatch as useDispatch } from '@elementor/store';

import { apiClient } from '../api';
import { slice } from '../store';

export function PopulateStore() {
	const dispatch = useDispatch();

	useEffect( () => {
		Promise.all( [ apiClient.all( 'preview' ), apiClient.all( 'frontend' ) ] ).then(
			( [ previewRes = {}, frontendRes = {} ] ) => {
				dispatch(
					slice.actions.load( {
						preview: previewRes.data ?? {},
						frontend: frontendRes.data ?? {},
					} )
				);
			}
		);
	}, [ dispatch ] );

	return null;
}
