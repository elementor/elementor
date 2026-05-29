import { type ElementSnapshotNode } from '../types';
import { walkElements } from './walk';

const IMAGE_LIKE_WIDGETS = new Set( [ 'image', 'image-box', 'image-carousel', 'gallery', 'image-gallery' ] );

export function extractAttachmentIds( tree: ElementSnapshotNode[] ): number[] {
	const ids = new Set< number >();

	walkElements( tree, ( node ) => {
		if ( node.elType !== 'widget' ) {
			return;
		}

		if ( ! IMAGE_LIKE_WIDGETS.has( node.widgetType ?? '' ) ) {
			return;
		}

		const image = node.settings.image as { id?: number } | undefined;

		if ( image?.id ) {
			ids.add( image.id );
		}

		const carousel = ( node.settings.carousel ?? node.settings.gallery ) as Array< { id?: number } > | undefined;

		if ( Array.isArray( carousel ) ) {
			for ( const item of carousel ) {
				if ( item?.id ) {
					ids.add( item.id );
				}
			}
		}
	} );

	return Array.from( ids ).sort( ( a, b ) => a - b );
}
