import { getMediaAttachment } from '@elementor/wp-media';

import { createTransformer } from '../create-transformer';
import type { TransformerOptions } from '../types';

type ImageSrc = {
	id?: unknown;
	url?: unknown;
};

export const imageSrcTransformer = createTransformer( async ( value: ImageSrc, { key }: TransformerOptions ) => {
	if ( key === 'list-style-image' ) {
		const imageUrl = await getImageUrl( value );

		return imageUrl ? `url("${ imageUrl }")` : null;
	}

	return {
		id: value.id ?? null,
		url: value.url ?? null,
	};
} );

async function getImageUrl( value: ImageSrc ) {
	if ( typeof value.id === 'number' ) {
		const attachment = await getMediaAttachment( { id: value.id } );

		if ( attachment?.url ) {
			return attachment.url;
		}
	}

	return typeof value.url === 'string' ? value.url : null;
}
