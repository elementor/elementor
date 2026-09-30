import { type ElementSnapshotNode } from '../../types';
import { walkAtomicImageSources } from '../atomic-image-sources';

const atomicImageProp = ( id: number, size = 'full' ) => ( {
	$$type: 'image',
	value: {
		src: {
			$$type: 'image-src',
			value: { id: { $$type: 'image-attachment-id', value: id }, url: null },
		},
		size: { $$type: 'string', value: size },
	},
} );

const atomicImageUrlProp = ( url: string ) => ( {
	$$type: 'image',
	value: {
		src: {
			$$type: 'image-src',
			value: { url: { $$type: 'url', value: url } },
		},
		size: null,
	},
} );

describe( 'walkAtomicImageSources', () => {
	it( 'yields the image prop of an atomic widget', () => {
		const tree: ElementSnapshotNode[] = [
			{
				id: 'e-image',
				elType: 'widget',
				widgetType: 'e-image',
				settings: { image: atomicImageProp( 1, 'large' ) },
				elements: [],
			},
		];

		const sources: Array< { nodeId: string; mediaId?: number; size?: string } > = [];
		walkAtomicImageSources( tree, ( { node, media } ) => {
			sources.push( { nodeId: node.id, mediaId: media.id, size: media.size } );
		} );

		expect( sources ).toEqual( [ { nodeId: 'e-image', mediaId: 1, size: 'large' } ] );
	} );

	it( 'yields the poster prop of an atomic video widget', () => {
		const tree: ElementSnapshotNode[] = [
			{
				id: 'video',
				elType: 'widget',
				widgetType: 'e-self-hosted-video',
				settings: { poster: atomicImageProp( 2 ) },
				elements: [],
			},
		];

		const sources: Array< { mediaId?: number } > = [];
		walkAtomicImageSources( tree, ( { media } ) => sources.push( { mediaId: media.id } ) );

		expect( sources ).toEqual( [ { mediaId: 2 } ] );
	} );

	it( 'falls back to the URL when no attachment id is set', () => {
		const tree: ElementSnapshotNode[] = [
			{
				id: 'e-image',
				elType: 'widget',
				widgetType: 'e-image',
				settings: { image: atomicImageUrlProp( 'http://example.test/a.jpg' ) },
				elements: [],
			},
		];

		const sources: Array< { mediaUrl?: string } > = [];
		walkAtomicImageSources( tree, ( { media } ) => sources.push( { mediaUrl: media.url } ) );

		expect( sources ).toEqual( [ { mediaUrl: 'http://example.test/a.jpg' } ] );
	} );

	it( 'ignores non-atomic widgets and empty props', () => {
		const tree: ElementSnapshotNode[] = [
			{ id: 'legacy', elType: 'widget', widgetType: 'image', settings: { image: { id: 5 } }, elements: [] },
			{ id: 'e-image', elType: 'widget', widgetType: 'e-image', settings: {}, elements: [] },
		];

		let count = 0;
		walkAtomicImageSources( tree, () => count++ );

		expect( count ).toBe( 0 );
	} );
} );
