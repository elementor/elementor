import { apiClient } from '../../api';

export function removeComponentStyles( id: number ) {
	apiClient.invalidateComponentConfigCache( id );
}
