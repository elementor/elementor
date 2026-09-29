import { type ElementSnapshotNode } from '../../types';
import { extractAttachmentIds } from '../page-attachments';

const tree: ElementSnapshotNode[] = [
	{
		id: 'a',
		elType: 'widget',
		widgetType: 'image',
		settings: { image: { id: 11, url: 'http://example.test/a.jpg' } },
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

describe( 'extractAttachmentIds', () => {
	it( 'collects attachment IDs from image and image-carousel widgets', () => {
		expect( extractAttachmentIds( tree ).sort() ).toEqual( [ 11, 12, 13 ] );
	} );

	it( 'returns a unique sorted list', () => {
		const duplicated: ElementSnapshotNode[] = [
			{ id: '1', elType: 'widget', widgetType: 'image', settings: { image: { id: 5 } }, elements: [] },
			{ id: '2', elType: 'widget', widgetType: 'image', settings: { image: { id: 5 } }, elements: [] },
		];
		expect( extractAttachmentIds( duplicated ) ).toEqual( [ 5 ] );
	} );

	it( 'ignores widgets without attachment IDs', () => {
		expect( extractAttachmentIds( [ tree[ 2 ] ] ) ).toEqual( [] );
	} );

	it( 'collects attachment IDs from image-gallery wp_gallery', () => {
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
		expect( extractAttachmentIds( galleryTree ) ).toEqual( [ 20, 21 ] );
	} );

	it( 'collects attachment IDs from container background_overlay_image and widget _background_hover_image', () => {
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
		expect( extractAttachmentIds( backgroundTree ) ).toEqual( [ 30, 31 ] );
	} );
} );
