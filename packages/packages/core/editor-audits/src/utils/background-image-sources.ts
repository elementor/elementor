import { type ElementSnapshotNode } from '../types';
import { type ImageLikeMedia } from './image-like-sources';
import { walkElements } from './walk';

const BACKGROUND_IMAGE_SETTING_KEYS = [
	'background_image',
	'background_hover_image',
	'background_overlay_image',
	'background_overlay_hover_image',
	'_background_image',
	'_background_hover_image',
] as const;

export type BackgroundImageSourceVisit = {
	node: ElementSnapshotNode;
	media: ImageLikeMedia;
};

export function walkBackgroundImageSources(
	tree: ElementSnapshotNode[],
	visit: ( source: BackgroundImageSourceVisit ) => void
): void {
	walkElements( tree, ( node ) => {
		for ( const key of BACKGROUND_IMAGE_SETTING_KEYS ) {
			const media = node.settings[ key ] as ImageLikeMedia | undefined;

			if ( media?.id || media?.url ) {
				visit( { node, media } );
			}
		}
	} );
}
