import { getQueryClient } from '@elementor/query';

import media from './media';
import normalize from './normalize';

async function fetchWpMediaAttachment( id: number ) {
	const model = media().attachment( id );
	const wpAttachment = model.toJSON();

	const isFetched = 'url' in wpAttachment;

	if ( isFetched ) {
		return normalize( wpAttachment );
	}

	try {
		return normalize( await model.fetch() );
	} catch {
		return null;
	}
}

export async function getMediaAttachment( { id }: { id: number | null } ) {
	if ( ! id ) {
		return null;
	}

	const queryClient = getQueryClient();

	return queryClient.ensureQueryData( {
		queryKey: [ 'wp-attachment', id ],
		queryFn: () => fetchWpMediaAttachment( id ),
	} );
}
