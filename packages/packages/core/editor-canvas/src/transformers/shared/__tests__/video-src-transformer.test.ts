import { getMediaAttachment } from '@elementor/wp-media';

import { videoSrcTransformer } from '../video-src-transformer';

jest.mock( '@elementor/wp-media' );

const mockedGetMediaAttachment = jest.mocked( getMediaAttachment );

describe( 'videoSrcTransformer', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'returns url when only url is provided', async () => {
		// Arrange.
		const value = {
			id: null,
			url: 'https://example.com/video.mp4',
		};

		// Act.
		const result = await videoSrcTransformer( value, { key: 'source' } );

		// Assert.
		expect( result ).toEqual( {
			id: null,
			url: 'https://example.com/video.mp4',
		} );
		expect( mockedGetMediaAttachment ).not.toHaveBeenCalled();
	} );

	it( 'resolves url from attachment when id is provided', async () => {
		// Arrange.
		mockedGetMediaAttachment.mockResolvedValue( {
			url: 'https://example.com/resolved-video.mp4',
		} as never );
		const value = {
			id: 123,
			url: null,
		};

		// Act.
		const result = await videoSrcTransformer( value, { key: 'source' } );

		// Assert.
		expect( result ).toEqual( {
			id: 123,
			url: 'https://example.com/resolved-video.mp4',
		} );
		expect( mockedGetMediaAttachment ).toHaveBeenCalledWith( { id: 123 } );
	} );

	it( 'uses attachment url over provided url when id exists', async () => {
		// Arrange.
		mockedGetMediaAttachment.mockResolvedValue( {
			url: 'https://example.com/attachment-url.mp4',
		} as never );
		const value = {
			id: 456,
			url: 'https://example.com/original-url.mp4',
		};

		// Act.
		const result = await videoSrcTransformer( value, { key: 'source' } );

		// Assert.
		expect( result ).toEqual( {
			id: 456,
			url: 'https://example.com/attachment-url.mp4',
		} );
	} );

	it( 'falls back to provided url when attachment lookup fails', async () => {
		// Arrange.
		mockedGetMediaAttachment.mockResolvedValue( null as never );
		const value = {
			id: 789,
			url: 'https://example.com/fallback.mp4',
		};

		// Act.
		const result = await videoSrcTransformer( value, { key: 'source' } );

		// Assert.
		expect( result ).toEqual( {
			id: 789,
			url: 'https://example.com/fallback.mp4',
		} );
	} );

	it( 'handles empty object', async () => {
		// Arrange.
		const value = {} as { id: null; url: null };

		// Act.
		const result = await videoSrcTransformer( value, { key: 'source' } );

		// Assert.
		expect( result ).toEqual( {
			id: null,
			url: undefined,
		} );
	} );

	it( 'handles both id and url being null', async () => {
		// Arrange.
		const value = {
			id: null,
			url: null,
		};

		// Act.
		const result = await videoSrcTransformer( value, { key: 'source' } );

		// Assert.
		expect( result ).toEqual( {
			id: null,
			url: null,
		} );
	} );

	it( 'handles id of 0 as falsy (no attachment lookup)', async () => {
		// Arrange.
		const value = {
			id: 0,
			url: 'https://example.com/video.mp4',
		};

		// Act.
		const result = await videoSrcTransformer( value, { key: 'source' } );

		// Assert.
		expect( result ).toEqual( {
			id: null,
			url: 'https://example.com/video.mp4',
		} );
		expect( mockedGetMediaAttachment ).not.toHaveBeenCalled();
	} );

	it( 'handles undefined url with valid id', async () => {
		// Arrange.
		mockedGetMediaAttachment.mockResolvedValue( {
			url: 'https://example.com/resolved.mp4',
		} as never );
		const value = {
			id: 123,
			url: undefined,
		} as { id: number; url: null };

		// Act.
		const result = await videoSrcTransformer( value, { key: 'source' } );

		// Assert.
		expect( result ).toEqual( {
			id: 123,
			url: 'https://example.com/resolved.mp4',
		} );
	} );
} );
