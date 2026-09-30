import {
	imageAttachmentIdPropType,
	imagePropTypeUtil,
	imageSrcPropTypeUtil,
	stringPropTypeUtil,
	urlPropTypeUtil,
} from '@elementor/editor-props';

import { type ElementSnapshotNode } from '../types';
import { type ImageLikeMedia } from './image-like-sources';
import { walkElements } from './walk';

const ATOMIC_IMAGE_PROP_KEYS = [ 'image', 'poster' ] as const;

export type AtomicImageSourceVisit = {
	node: ElementSnapshotNode;
	media: ImageLikeMedia;
};

export function walkAtomicImageSources(
	tree: ElementSnapshotNode[],
	visit: ( source: AtomicImageSourceVisit ) => void
): void {
	walkElements( tree, ( node ) => {
		if ( node.elType !== 'widget' ) {
			return;
		}

		for ( const key of ATOMIC_IMAGE_PROP_KEYS ) {
			const media = extractAtomicImageMedia( node.settings[ key ] );

			if ( media ) {
				visit( { node, media } );
			}
		}
	} );
}

export function extractAtomicImageMedia( imageProp: unknown ): ImageLikeMedia | null {
	const image = imagePropTypeUtil.extract( imageProp );

	if ( ! image ) {
		return null;
	}

	const src = imageSrcPropTypeUtil.extract( image.src );

	if ( ! src ) {
		return null;
	}

	const id = imageAttachmentIdPropType.extract( src.id ) ?? undefined;
	const url = urlPropTypeUtil.extract( src.url ) ?? undefined;

	if ( ! id && ! url ) {
		return null;
	}

	const size = stringPropTypeUtil.extract( image.size ) ?? undefined;

	return { id, url, size };
}
