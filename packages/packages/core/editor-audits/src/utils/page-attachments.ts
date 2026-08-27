import { type ElementSnapshotNode } from '../types';
import { walkImageLikeSources } from './image-like-sources';

export function extractAttachmentIds( tree: ElementSnapshotNode[] ): number[] {
	const ids = new Set< number >();

	walkImageLikeSources( tree, ( { media } ) => {
		if ( media.id ) {
			ids.add( media.id );
		}
	} );

	return Array.from( ids ).sort( ( a, b ) => a - b );
}
