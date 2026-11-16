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

export const ATOMIC_CONTENT_IMAGE_PROP_KEYS = [ 'image' ] as const;

const ATOMIC_IMAGE_PROP_KEYS = [ ...ATOMIC_CONTENT_IMAGE_PROP_KEYS, 'poster' ] as const;

export type AtomicImageSourceVisit = {
	node: ElementSnapshotNode;
	media: ImageLikeMedia;
};

export function walkAtomicImageSources(
	tree: ElementSnapshotNode[],
	visit: ( source: AtomicImageSourceVisit ) => void,
	propKeys: readonly string[] = ATOMIC_IMAGE_PROP_KEYS
): void {
	walkElements( tree, ( node ) => {
		if ( node.elType !== 'widget' ) {
			return;
		}

		for ( const key of propKeys ) {
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

	const alt = stringPropTypeUtil.extract( src.alt ) ?? undefined;
	const size = stringPropTypeUtil.extract( image.size ) ?? undefined;

	return { id, url, alt, size };
}
