import { type ElementSnapshotNode } from '../types';
import { walkElements } from './walk';

export const IMAGE_LIKE_WIDGETS = new Set( [ 'image', 'image-box', 'image-carousel', 'gallery', 'image-gallery' ] );

export type ImageLikeMedia = {
	id?: number;
	url?: string;
	alt?: string;
};

export type ImageLikeSourceVisit = {
	node: ElementSnapshotNode;
	media: ImageLikeMedia;
};

export function hasPageImages( tree: ElementSnapshotNode[] ): boolean {
	let found = false;

	walkImageLikeSources( tree, ( { media } ) => {
		if ( media.id || media.url ) {
			found = true;
		}
	} );

	return found;
}

export function walkImageLikeSources(
	tree: ElementSnapshotNode[],
	visit: ( source: ImageLikeSourceVisit ) => void
): void {
	walkElements( tree, ( node ) => {
		if ( node.elType !== 'widget' ) {
			return;
		}

		if ( ! IMAGE_LIKE_WIDGETS.has( node.widgetType ?? '' ) ) {
			return;
		}

		for ( const media of collectMediaFromNode( node ) ) {
			visit( { node, media } );
		}
	} );
}

function collectMediaFromNode( node: ElementSnapshotNode ): ImageLikeMedia[] {
	const sources: ImageLikeMedia[] = [];

	const image = node.settings.image as ImageLikeMedia | undefined;

	if ( image?.id || image?.url ) {
		sources.push( image );
	}

	const gallery = ( node.settings.carousel ?? node.settings.gallery ?? node.settings.wp_gallery ) as
		| ImageLikeMedia[]
		| undefined;

	if ( Array.isArray( gallery ) ) {
		for ( const item of gallery ) {
			if ( item?.id || item?.url ) {
				sources.push( item );
			}
		}
	}

	return sources;
}
