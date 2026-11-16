import { getElementStyles } from '@elementor/editor-elements';
import {
	backgroundImageOverlayPropTypeUtil,
	backgroundOverlayPropTypeUtil,
	backgroundPropTypeUtil,
} from '@elementor/editor-props';
import { type StyleDefinition } from '@elementor/editor-styles';

import { type ElementSnapshotNode } from '../types';
import { extractAtomicImageMedia } from './atomic-image-sources';
import { type ImageLikeMedia } from './image-like-sources';
import { walkElements } from './walk';

export type AtomicBackgroundImageSourceVisit = {
	node: ElementSnapshotNode;
	media: ImageLikeMedia;
};

export function walkAtomicBackgroundImageSources(
	tree: ElementSnapshotNode[],
	visit: ( source: AtomicBackgroundImageSourceVisit ) => void
): void {
	walkElements( tree, ( node ) => {
		const styles = getElementStyles( node.id );

		if ( ! styles ) {
			return;
		}

		for ( const media of extractBackgroundImageMedia( styles ) ) {
			visit( { node, media } );
		}
	} );
}

function extractBackgroundImageMedia( styles: Record< string, StyleDefinition > ): ImageLikeMedia[] {
	const sources: ImageLikeMedia[] = [];

	for ( const style of Object.values( styles ) ) {
		for ( const variant of style.variants ) {
			const background = backgroundPropTypeUtil.extract( variant.props.background );
			const overlays = backgroundOverlayPropTypeUtil.extract( background?.[ 'background-overlay' ] ) ?? [];

			for ( const overlay of overlays ) {
				const imageOverlay = backgroundImageOverlayPropTypeUtil.extract( overlay );
				const media = extractAtomicImageMedia( imageOverlay?.image );

				if ( media ) {
					sources.push( media );
				}
			}
		}
	}

	return sources;
}
