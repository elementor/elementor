import { __dispatch as dispatch } from '@elementor/store';

import { apiClient } from '../../api';
import { slice } from '../store';

export function removeComponentStyles( id: number ) {
	apiClient.invalidateComponentConfigCache( id );
	dispatch( slice.actions.removeStyles( { id } ) );
}
