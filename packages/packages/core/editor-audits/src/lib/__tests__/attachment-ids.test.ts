import { type ElementSnapshotNode } from '../../types';
import { extractAttachmentIds } from '../attachment-ids';

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
} );
