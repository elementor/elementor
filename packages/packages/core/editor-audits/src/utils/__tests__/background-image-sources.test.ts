import { type ElementSnapshotNode } from '../../types';
import { walkBackgroundImageSources } from '../background-image-sources';

const media = ( id: number ) => ( { id, url: `http://example.test/${ id }.jpg` } );

describe( 'walkBackgroundImageSources', () => {
	it( 'yields background_image and background_hover_image from a container', () => {
		const tree: ElementSnapshotNode[] = [
			{
				id: 'container',
				elType: 'container',
				settings: {
					background_image: media( 1 ),
					background_hover_image: media( 2 ),
				},
				elements: [],
			},
		];

		const mediaIds: number[] = [];
		walkBackgroundImageSources( tree, ( { media: source } ) => {
			mediaIds.push( source.id as number );
		} );

		expect( mediaIds.sort() ).toEqual( [ 1, 2 ] );
	} );

	it( 'yields background_overlay_image and background_overlay_hover_image from a container', () => {
		const tree: ElementSnapshotNode[] = [
			{
				id: 'container',
				elType: 'container',
				settings: {
					background_overlay_image: media( 3 ),
					background_overlay_hover_image: media( 4 ),
				},
				elements: [],
			},
		];

		const mediaIds: number[] = [];
		walkBackgroundImageSources( tree, ( { media: source } ) => {
			mediaIds.push( source.id as number );
		} );

		expect( mediaIds.sort() ).toEqual( [ 3, 4 ] );
	} );

	it( 'yields _background_image and _background_hover_image from any widget', () => {
		const tree: ElementSnapshotNode[] = [
			{
				id: 'heading',
				elType: 'widget',
				widgetType: 'heading',
				settings: {
					title: 'Hello',
					_background_image: media( 5 ),
					_background_hover_image: media( 6 ),
				},
				elements: [],
			},
		];

		const nodeIds: string[] = [];
		const mediaIds: number[] = [];
		walkBackgroundImageSources( tree, ( { node, media: source } ) => {
			nodeIds.push( node.id );
			mediaIds.push( source.id as number );
		} );

		expect( nodeIds ).toEqual( [ 'heading', 'heading' ] );
		expect( mediaIds.sort() ).toEqual( [ 5, 6 ] );
	} );

	it( 'ignores nodes without background image settings', () => {
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
		walkBackgroundImageSources( tree, () => {
			count++;
		} );

		expect( count ).toBe( 0 );
	} );

	it( 'ignores background settings without an id or url', () => {
		const tree: ElementSnapshotNode[] = [
			{
				id: 'container',
				elType: 'container',
				settings: { background_image: { id: undefined, url: '' } },
				elements: [],
			},
		];

		let count = 0;
		walkBackgroundImageSources( tree, () => {
			count++;
		} );

		expect( count ).toBe( 0 );
	} );
} );
