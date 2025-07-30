import { useQuery } from '@elementor/query';

import { getMediaAttachment } from '../get-media-attachment';

export default function useWpMediaAttachment( id: number | null ) {
	return useQuery( {
		queryKey: [ 'wp-attachment', id ],
		queryFn: () => getMediaAttachment( { id } ),
		enabled: !! id,
	} );
}
