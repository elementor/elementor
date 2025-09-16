import { useEffect } from 'react';
import { __useDispatch as useDispatch } from '@elementor/store';

import { apiClient } from './api';
import { slice } from './store';

export function PopulateStore() {
	const dispatch = useDispatch();

	useEffect( () => {
		apiClient.get().then( ( response ) => {
			dispatch( slice.actions.load( response ) );
		} );
	}, [ dispatch ] );

	return null;
}
