import { type ElementSnapshotNode } from '../types';
import { walkAllImageSources } from './all-image-sources';
import { buildImageSizeKey } from './image-size-key';

export function extractImageSizeRequests( tree: ElementSnapshotNode[] ): string[] {
	const keys = new Set< string >();

	walkAllImageSources( tree, ( { media } ) => {
		if ( media.id ) {
			keys.add( buildImageSizeKey( { id: media.id, size: media.size } ) );
		}
	} );

	return Array.from( keys ).sort();
}
