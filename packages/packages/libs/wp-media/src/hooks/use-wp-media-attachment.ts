import { useQuery } from '@elementor/query';

import { fetchAttachmentFromWP } from '../get-media-attachment';

export default function useWpMediaAttachment( id: number | null ) {
	return useQuery( {
		queryKey: [ 'wp-attachment', id ],
		queryFn: () => fetchAttachmentFromWP( id as number ),
		enabled: !! id,
	} );
}
