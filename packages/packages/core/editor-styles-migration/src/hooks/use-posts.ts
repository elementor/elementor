import { httpService } from '@elementor/http-client';
import { useQuery } from '@elementor/query';

export function usePosts() {
	return useQuery( {
		queryKey: [ 'styles-migration-posts' ],
		queryFn: () => {
			return apiClient.getPosts().then( ( response ) => {
				return response.data;
			} );
		},
	} );
}

const RESOURCE_URL = '/design-system-generator';

export const apiClient = {
	getPosts: () => httpService().get( 'elementor/v1' + RESOURCE_URL + '/posts' ),
};
