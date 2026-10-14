import { type ElementSnapshotNode } from '../../types';
import { extractImageSizeRequests } from '../page-attachments';

const tree: ElementSnapshotNode[] = [
	{
		id: 'a',
		elType: 'widget',
		widgetType: 'image',
		settings: { image: { id: 11, url: 'http://example.test/a.jpg' }, image_size: 'large' },
		elements: [],
	},
	{
		id: 'b',
		elType: 'widget',
		widgetType: 'image-carousel',
		settings: {
			carousel: [
				{ id: 12, url: '...' },
				{ id: 13, url: '...' },
			],
			thumbnail_size: 'medium',
		},
		elements: [],
	},
	{
		id: 'c',
		elType: 'widget',
		widgetType: 'image',
		settings: { image: { url: 'http://example.test/external.jpg' } },
		elements: [],
	},
];

describe( 'extractImageSizeRequests', () => {
	it( 'collects composite size keys from image and image-carousel widgets', () => {
		expect( extractImageSizeRequests( tree ).sort() ).toEqual( [ '11:large', '12:medium', '13:medium' ] );
	} );

	it( 'returns a unique sorted list', () => {
		const duplicated: ElementSnapshotNode[] = [
			{ id: '1', elType: 'widget', widgetType: 'image', settings: { image: { id: 5 } }, elements: [] },
			{ id: '2', elType: 'widget', widgetType: 'image', settings: { image: { id: 5 } }, elements: [] },
		];
		expect( extractImageSizeRequests( duplicated ) ).toEqual( [ '5:full' ] );
	} );

	it( 'ignores widgets without attachment IDs', () => {
		expect( extractImageSizeRequests( [ tree[ 2 ] ] ) ).toEqual( [] );
	} );

	it( 'collects image size requests from image-gallery wp_gallery', () => {
		const galleryTree: ElementSnapshotNode[] = [
			{
				id: 'g',
				elType: 'widget',
				widgetType: 'image-gallery',
				settings: {
					wp_gallery: [
						{ id: 20, url: 'http://example.test/1.jpg' },
						{ id: 21, url: 'http://example.test/2.jpg' },
					],
				},
				elements: [],
			},
		];
		expect( extractImageSizeRequests( galleryTree ) ).toEqual( [ '20:full', '21:full' ] );
	} );

	it( 'collects image size requests from container background_overlay_image and widget _background_hover_image', () => {
		const backgroundTree: ElementSnapshotNode[] = [
			{
				id: 'container',
				elType: 'container',
				settings: {
					background_overlay_image: { id: 30, url: 'http://example.test/overlay.jpg' },
				},
				elements: [
					{
						id: 'heading',
						elType: 'widget',
						widgetType: 'heading',
						settings: {
							title: 'Hello',
							_background_hover_image: { id: 31, url: 'http://example.test/bg-hover.jpg' },
						},
						elements: [],
					},
				],
			},
		];
		expect( extractImageSizeRequests( backgroundTree ) ).toEqual( [ '30:full', '31:full' ] );
	} );

	it( 'collects image size requests from atomic widget image and poster props', () => {
		const atomicTree: ElementSnapshotNode[] = [
			{
				id: 'e-image',
				elType: 'widget',
				widgetType: 'e-image',
				settings: {
					image: {
						$$type: 'image',
						value: {
							src: {
								$$type: 'image-src',
								value: { id: { $$type: 'image-attachment-id', value: 40 }, url: null },
							},
							size: { $$type: 'string', value: 'medium' },
						},
					},
				},
				elements: [],
			},
		];
		expect( extractImageSizeRequests( atomicTree ) ).toEqual( [ '40:medium' ] );
	} );
} );
