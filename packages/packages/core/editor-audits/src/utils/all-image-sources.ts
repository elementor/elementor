import { type ElementSnapshotNode } from '../types';
import { walkAtomicBackgroundImageSources } from './atomic-background-image-sources';
import { walkAtomicImageSources } from './atomic-image-sources';
import { walkBackgroundImageSources } from './background-image-sources';
import { type ImageLikeMedia, walkImageLikeSources } from './image-like-sources';

export type ImageSourceVisit = {
	node: ElementSnapshotNode;
	media: ImageLikeMedia;
};

export function walkAllImageSources( tree: ElementSnapshotNode[], visit: ( source: ImageSourceVisit ) => void ): void {
	walkImageLikeSources( tree, visit );
	walkBackgroundImageSources( tree, visit );
	walkAtomicImageSources( tree, visit );
	walkAtomicBackgroundImageSources( tree, visit );
}
