import { type QueryClient } from '@elementor/query';
import { waitFor } from '@testing-library/react';

import { getMediaAttachment } from '../../get-media-attachment';
import media from '../../media';
import { type Attachment } from '../../types/attachment';
import { type WpAttachmentJSON } from '../../types/wp-media';

jest.mock( '@elementor/query', () => {
	const actual = jest.requireActual( '@elementor/query' );
	const sharedClient = new actual.QueryClient( {
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	} );

	return {
		...actual,
		getQueryClient: jest.fn( () => sharedClient ),
		__sharedClient: sharedClient,
	};
} );

jest.mock( '../../media', () => ( {
	__esModule: true,
	default: jest.fn().mockReturnValue( {
		attachment: jest.fn(),
	} ),
} ) );

const sharedQueryClient: QueryClient = require( '@elementor/query' ).__sharedClient;

describe( 'getMediaAttachment', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		sharedQueryClient.clear();
	} );

	it( 'should return null when there is no attachment id', async () => {
		const result = await getMediaAttachment( { id: null } );

		expect( result ).toBeNull();
	} );

	it( "should return the normalized attachment if it's fetched", async () => {
		const wpAttachment: WpAttachmentJSON = {
			id: 0,
			url: 'url',
			alt: 'alt',
			height: 0,
			width: 0,
			filename: 'filename',
			title: 'title',
			mime: 'mime',
			sizes: {},
			type: 'type',
			subtype: 'subtype',
			uploadedTo: 2,
			filesizeInBytes: 3,
			filesizeHumanReadable: 'filesizeHumanReadable',
			author: '4',
			authorName: 'authorName',
		};

		jest.mocked( media().attachment ).mockImplementation( ( id ) => {
			return {
				toJSON: () => ( { ...wpAttachment, id } ),
				fetch: () => Promise.resolve( { ...wpAttachment, id } ),
			};
		} );

		const result = await getMediaAttachment( { id: 123 } );

		const expected: Attachment = {
			id: 123,
			url: 'url',
			alt: 'alt',
			height: 0,
			width: 0,
			filename: 'filename',
			title: 'title',
			mime: 'mime',
			sizes: {},
			type: 'type',
			subtype: 'subtype',
			uploadedTo: 2,
			filesize: {
				inBytes: 3,
				humanReadable: 'filesizeHumanReadable',
			},
			author: {
				id: 4,
				name: 'authorName',
			},
		};

		await waitFor( () => {
			expect( result ).toEqual( expected );
		} );
	} );

	it( 'should fetch the attachment and return it normalized', async () => {
		const wpAttachment: WpAttachmentJSON = {
			id: 0,
			url: 'url',
			alt: 'alt',
			height: 0,
			width: 0,
			filename: 'filename',
			title: 'title',
			mime: 'mime',
			sizes: {},
			type: 'type',
			subtype: 'subtype',
			uploadedTo: 2,
			filesizeInBytes: 3,
			filesizeHumanReadable: 'filesizeHumanReadable',
			author: '4',
			authorName: 'authorName',
		};

		jest.mocked( media().attachment ).mockImplementation( ( id ) => {
			return {
				toJSON: () => ( { id } ),
				fetch: () => Promise.resolve( { ...wpAttachment, id } ),
			};
		} );

		const result = await getMediaAttachment( { id: 123 } );

		const expected: Attachment = {
			id: 123,
			url: 'url',
			alt: 'alt',
			height: 0,
			width: 0,
			filename: 'filename',
			title: 'title',
			mime: 'mime',
			sizes: {},
			type: 'type',
			subtype: 'subtype',
			uploadedTo: 2,
			filesize: {
				inBytes: 3,
				humanReadable: 'filesizeHumanReadable',
			},
			author: {
				id: 4,
				name: 'authorName',
			},
		};

		await waitFor( () => {
			expect( result ).toEqual( expected );
		} );
	} );

	it( "should return null when the attachment can't be fetched", async () => {
		jest.mocked( media().attachment ).mockImplementation( ( id ) => {
			return {
				toJSON: () => ( { id } ),
				fetch: () => Promise.reject(),
			};
		} );

		const result = await getMediaAttachment( { id: 123 } );

		await waitFor( () => {
			expect( result ).toBeNull();
		} );
	} );

	it( 'should deduplicate concurrent fetches for the same attachment id', async () => {
		const wpAttachment: WpAttachmentJSON = {
			id: 123,
			url: 'https://example.com/image.jpg',
			alt: '',
			height: 0,
			width: 0,
			filename: 'image.jpg',
			title: 'image',
			mime: 'image/jpeg',
			sizes: {},
			type: 'image',
			subtype: 'jpeg',
			uploadedTo: 0,
			filesizeInBytes: 0,
			filesizeHumanReadable: '0',
			author: '1',
			authorName: 'author',
		};

		let resolveFetch: ( value: WpAttachmentJSON ) => void;
		const fetchPromise = new Promise< WpAttachmentJSON >( ( resolve ) => {
			resolveFetch = resolve;
		} );

		const attachmentMock = jest.fn( () => ( {
			toJSON: () => ( { id: 123 } ),
			fetch: () => fetchPromise,
		} ) );

		jest.mocked( media().attachment ).mockImplementation( attachmentMock );

		const first = getMediaAttachment( { id: 123 } );
		const second = getMediaAttachment( { id: 123 } );

		resolveFetch!( wpAttachment );

		const [ firstResult, secondResult ] = await Promise.all( [ first, second ] );

		expect( attachmentMock ).toHaveBeenCalledTimes( 1 );
		expect( firstResult?.url ).toBe( 'https://example.com/image.jpg' );
		expect( secondResult ).toEqual( firstResult );
	} );

	it( 'should return cached attachment without fetching wp.media again', async () => {
		const wpAttachment: WpAttachmentJSON = {
			id: 456,
			url: 'https://example.com/cached.jpg',
			alt: '',
			height: 0,
			width: 0,
			filename: 'cached.jpg',
			title: 'cached',
			mime: 'image/jpeg',
			sizes: {},
			type: 'image',
			subtype: 'jpeg',
			uploadedTo: 0,
			filesizeInBytes: 0,
			filesizeHumanReadable: '0',
			author: '1',
			authorName: 'author',
		};

		const attachmentMock = jest.fn( () => ( {
			toJSON: () => ( { ...wpAttachment } ),
			fetch: () => Promise.resolve( wpAttachment ),
		} ) );

		jest.mocked( media().attachment ).mockImplementation( attachmentMock );

		await getMediaAttachment( { id: 456 } );
		const cached = await getMediaAttachment( { id: 456 } );

		expect( attachmentMock ).toHaveBeenCalledTimes( 1 );
		expect( cached?.url ).toBe( 'https://example.com/cached.jpg' );
	} );
} );
