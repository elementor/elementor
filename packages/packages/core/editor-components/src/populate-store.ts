import { useEffect } from 'react';
import { __dispatch as dispatch } from '@elementor/store';

import loadComponents from './actions/load-components';

export function PopulateStore() {
	useEffect( () => {
		dispatch( loadComponents() );
	}, [] );

	return null;
}
