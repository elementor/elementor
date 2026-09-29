import { type ElementSnapshotNode } from '../types';
import { walkBackgroundImageSources } from './background-image-sources';
import { walkImageLikeSources } from './image-like-sources';

export function extractAttachmentIds( tree: ElementSnapshotNode[] ): number[] {
	const ids = new Set< number >();

	const collect = ( media: { id?: number } ) => {
		if ( media.id ) {
			ids.add( media.id );
		}
	};

	walkImageLikeSources( tree, ( { media } ) => collect( media ) );
	walkBackgroundImageSources( tree, ( { media } ) => collect( media ) );

	return Array.from( ids ).sort( ( a, b ) => a - b );
}
