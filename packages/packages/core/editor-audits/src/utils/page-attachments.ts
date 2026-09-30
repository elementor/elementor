import { type ElementSnapshotNode } from '../types';
import { walkAtomicBackgroundImageSources } from './atomic-background-image-sources';
import { walkAtomicImageSources } from './atomic-image-sources';
import { walkBackgroundImageSources } from './background-image-sources';
import { type ImageLikeMedia, walkImageLikeSources } from './image-like-sources';
import { buildImageSizeKey } from './image-size-key';

export function extractImageSizeRequests( tree: ElementSnapshotNode[] ): string[] {
	const keys = new Set< string >();

	const collect = ( media: ImageLikeMedia ) => {
		if ( media.id ) {
			keys.add( buildImageSizeKey( { id: media.id, size: media.size } ) );
		}
	};

	walkImageLikeSources( tree, ( { media } ) => collect( media ) );
	walkBackgroundImageSources( tree, ( { media } ) => collect( media ) );
	walkAtomicImageSources( tree, ( { media } ) => collect( media ) );
	walkAtomicBackgroundImageSources( tree, ( { media } ) => collect( media ) );

	return Array.from( keys ).sort();
}
