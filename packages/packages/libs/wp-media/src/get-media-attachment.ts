import media from './media';
import normalize from './normalize';
import { type Attachment } from './types/attachment';

const resolvedAttachments = new Map< number, Attachment >();
const inFlightAttachments = new Map< number, Promise< Attachment | null > >();

export function clearMediaAttachmentCache(): void {
	resolvedAttachments.clear();
	inFlightAttachments.clear();
}

export async function getMediaAttachment( { id }: { id: number | null } ): Promise< Attachment | null > {
	if ( ! id ) {
		return null;
	}

	const cached = resolvedAttachments.get( id );

	if ( cached ) {
		return cached;
	}

	const inFlight = inFlightAttachments.get( id );

	if ( inFlight ) {
		return inFlight;
	}

	const request = loadMediaAttachment( id ).finally( () => {
		inFlightAttachments.delete( id );
	} );

	inFlightAttachments.set( id, request );

	return request;
}

async function loadMediaAttachment( id: number ): Promise< Attachment | null > {
	const model = media().attachment( id );
	const wpAttachment = model.toJSON();

	const isFetched = 'url' in wpAttachment;

	if ( isFetched ) {
		const normalized = normalize( wpAttachment );
		resolvedAttachments.set( id, normalized );

		return normalized;
	}

	try {
		const normalized = normalize( await model.fetch() );
		resolvedAttachments.set( id, normalized );

		return normalized;
	} catch {
		return null;
	}
}
