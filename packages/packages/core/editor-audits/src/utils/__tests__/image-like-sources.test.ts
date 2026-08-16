import { type ElementSnapshotNode } from '../../types';
import { walkImageLikeSources } from '../image-like-sources';

describe( 'walkImageLikeSources', () => {
	it( 'yields single image and carousel items', () => {
		const tree: ElementSnapshotNode[] = [
			{
				id: 'img',
				elType: 'widget',
				widgetType: 'image',
				settings: { image: { id: 1, url: 'http://example.test/a.jpg' } },
				elements: [],
			},
			{
				id: 'carousel',
				elType: 'widget',
				widgetType: 'image-carousel',
				settings: {
					carousel: [
						{ id: 2, url: 'http://example.test/b.jpg' },
						{ id: 3, url: 'http://example.test/c.jpg' },
					],
				},
				elements: [],
			},
		];

		const sources: Array< { nodeId: string; mediaId?: number } > = [];
		walkImageLikeSources( tree, ( { node, media } ) => {
			sources.push( { nodeId: node.id, mediaId: media.id } );
		} );

		expect( sources ).toEqual( [
			{ nodeId: 'img', mediaId: 1 },
			{ nodeId: 'carousel', mediaId: 2 },
			{ nodeId: 'carousel', mediaId: 3 },
		] );
	} );

	it( 'yields wp_gallery items from image-gallery', () => {
		const tree: ElementSnapshotNode[] = [
			{
				id: 'gallery',
				elType: 'widget',
				widgetType: 'image-gallery',
				settings: {
					wp_gallery: [ { id: 10, url: 'http://example.test/x.jpg' } ],
				},
				elements: [],
			},
		];

		const nodeIds: string[] = [];
		walkImageLikeSources( tree, ( { node } ) => {
			nodeIds.push( node.id );
		} );

		expect( nodeIds ).toEqual( [ 'gallery' ] );
	} );

	it( 'ignores non image-like widgets', () => {
		const tree: ElementSnapshotNode[] = [
			{
				id: 'heading',
				elType: 'widget',
				widgetType: 'heading',
				settings: { title: 'Hello' },
				elements: [],
			},
		];

		let count = 0;
		walkImageLikeSources( tree, () => {
			count++;
		} );

		expect( count ).toBe( 0 );
	} );
} );
