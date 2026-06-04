import { type ImageLikeMedia } from './image-like-sources';
import { type PageContextResponse } from '../types';

export function hasMeaningfulAlt( media: ImageLikeMedia, pageContext: PageContextResponse ): boolean {
	if ( ! media.id && ! media.url ) {
		return true;
	}

	if ( media.id ) {
		const alt = pageContext.image_sizes[ media.id ]?.alt ?? '';
		return alt.trim().length > 0;
	}

	return ( media.alt ?? '' ).trim().length > 0;
}

export function isImageSourcePresent( media: ImageLikeMedia ): boolean {
	return Boolean( media.id || media.url );
}
