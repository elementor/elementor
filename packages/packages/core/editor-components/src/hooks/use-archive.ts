import { useCallback } from 'react';
import { __useDispatch as useDispatch } from '@elementor/store';

import { slice } from '../store/store';

export const useArchive = () => {
	const dispatch = useDispatch();

	return useCallback(
		( componentId: number ) => {
			dispatch( slice.actions.archive( componentId ) );
		},
		[ dispatch ]
	);
};
