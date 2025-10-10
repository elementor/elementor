import media from './media';
import normalize from './normalize';

export async function getMediaAttachment( { id }: { id: number | null } ) {
	if ( ! id ) {
		return null;
	}

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
