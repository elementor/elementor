import { useQuery } from '@elementor/query';

import { getUser } from '../api/user';

const userQueryKey = () => [ 'site-navigation', 'user' ];

export default function useUser() {
	return useQuery( {
		queryKey: userQueryKey(),
		queryFn: () => getUser(),
	} );
}
