import { type ElementSnapshotNode } from '../types';
import { type ImageSourceVisit } from './all-image-sources';
import { ATOMIC_CONTENT_IMAGE_PROP_KEYS, walkAtomicImageSources } from './atomic-image-sources';
import { walkImageLikeSources } from './image-like-sources';

export function walkAltTextImageSources(
	tree: ElementSnapshotNode[],
	visit: ( source: ImageSourceVisit ) => void
): void {
	walkImageLikeSources( tree, visit );
	walkAtomicImageSources( tree, visit, ATOMIC_CONTENT_IMAGE_PROP_KEYS );
}

export function hasAltTextImages( tree: ElementSnapshotNode[] ): boolean {
	let found = false;

	walkAltTextImageSources( tree, ( { media } ) => {
		if ( media.id || media.url ) {
			found = true;
		}
	} );

	return found;
}
