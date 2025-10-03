import { __dispatch as dispatch } from '@elementor/store';

import { apiClient } from '../api';
import { slice } from './store';

export function removeComponentStyles( id: number ) {
	apiClient.invalidateCache( id );
	dispatch( slice.actions.remove( { id } ) );
}
