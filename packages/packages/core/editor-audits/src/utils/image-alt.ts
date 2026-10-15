import { type PageContextResponse } from '../types';
import { type ImageLikeMedia } from './image-like-sources';
import { buildImageSizeKey } from './image-size-key';

export function hasMeaningfulAlt( media: ImageLikeMedia, pageContext: PageContextResponse ): boolean {
	if ( ! media.id && ! media.url ) {
		return true;
	}

	if ( media.id ) {
		const key = buildImageSizeKey( { id: media.id, size: media.size } );
		const alt = pageContext.image_sizes[ key ]?.alt ?? '';
		return alt.trim().length > 0;
	}

	return ( media.alt ?? '' ).trim().length > 0;
}

export function isImageSourcePresent( media: ImageLikeMedia ): boolean {
	return Boolean( media.id || media.url );
}
