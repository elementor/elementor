import { waitFor } from '@testing-library/react';

import { getMediaAttachment } from '../../get-media-attachment';
import media from '../../media';
import { type Attachment } from '../../types/attachment';
import { type WpAttachmentJSON } from '../../types/wp-media';

jest.mock( '../../media', () => ( {
	__esModule: true,
	default: jest.fn().mockReturnValue( {
		attachment: jest.fn(),
	} ),
} ) );

describe( 'getMediaAttachment', () => {
	it( 'should return null when there is no attachment id', async () => {
		// Act.
		const result = await getMediaAttachment( { id: null } );

		// Assert.
		expect( result ).toBeNull();
	} );

	it( "should return the normalized attachment if it's fetched", async () => {
		// Arrange.
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

		// Act.

		const result = await getMediaAttachment( { id: 123 } );

		// Assert.
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
		// Arrange.
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

		// Act.
		const result = await getMediaAttachment( { id: 123 } );

		// Assert.
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
		// Arrange.
		jest.mocked( media().attachment ).mockImplementation( ( id ) => {
			return {
				toJSON: () => ( { id } ),
				fetch: () => Promise.reject(),
			};
		} );

		// Act.

		const result = await getMediaAttachment( { id: 123 } );

		// Assert.
		await waitFor( () => {
			expect( result ).toBeNull();
		} );
	} );
} );
