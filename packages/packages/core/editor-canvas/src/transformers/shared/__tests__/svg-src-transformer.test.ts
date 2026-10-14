import { getMediaAttachment } from '@elementor/wp-media';

import { svgSrcTransformer } from '../svg-src-transformer';

jest.mock( '@elementor/wp-media' );

const mockedGetMediaAttachment = jest.mocked( getMediaAttachment );

const SAMPLE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><path d="M0 0h100v100H0z"/></svg>';

const mockFetch = ( body: string, contentType = 'image/svg+xml', ok = true ) => {
	global.fetch = jest.fn().mockResolvedValue( {
		ok,
		headers: new Headers( { 'content-type': contentType } ),
		text: () => Promise.resolve( body ),
	} );
};

describe( 'svgSrcTransformer', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	afterEach( () => {
		jest.restoreAllMocks();
	} );

	it( 'fetches SVG and returns processed html with currentColor fill', async () => {
		// Arrange.
		mockFetch( SAMPLE_SVG );

		// Act.
		const result = await svgSrcTransformer( { id: null, url: 'https://example.com/icon.svg' }, { key: 'svg' } );

		// Assert.
		expect( result ).toEqual( {
			html: expect.stringContaining( 'fill="currentColor"' ),
			url: 'https://example.com/icon.svg',
		} );
	} );

	it( 'adds inline styles to the svg element', async () => {
		// Arrange.
		mockFetch( SAMPLE_SVG );

		// Act.
		const result = ( await svgSrcTransformer(
			{ id: null, url: 'https://example.com/icon.svg' },
			{ key: 'svg' }
		) ) as { html: string; url: string };

		// Assert.
		expect( result.html ).toContain( 'width: 100%' );
		expect( result.html ).toContain( 'height: 100%' );
		expect( result.html ).toContain( 'overflow: unset' );
	} );

	it( 'returns null html when url is null', async () => {
		// Arrange & Act.
		const result = await svgSrcTransformer( { id: null, url: null }, { key: 'svg' } );

		// Assert.
		expect( result ).toEqual( { html: null, url: null } );
		expect( mockedGetMediaAttachment ).not.toHaveBeenCalled();
	} );

	it( 'resolves url from attachment id then fetches SVG', async () => {
		// Arrange.
		mockedGetMediaAttachment.mockResolvedValue( {
			url: 'https://example.com/resolved.svg',
		} as never );
		mockFetch( SAMPLE_SVG );

		// Act.
		const result = await svgSrcTransformer( { id: 42, url: null }, { key: 'svg' } );

		// Assert.
		expect( mockedGetMediaAttachment ).toHaveBeenCalledWith( { id: 42 } );
		expect( result ).toEqual( {
			html: expect.stringContaining( 'fill="currentColor"' ),
			url: 'https://example.com/resolved.svg',
		} );
	} );

	it( 'falls back to provided url when attachment lookup fails', async () => {
		// Arrange.
		mockedGetMediaAttachment.mockResolvedValue( null as never );
		mockFetch( SAMPLE_SVG );

		// Act.
		const result = ( await svgSrcTransformer(
			{ id: 99, url: 'https://example.com/fallback.svg' },
			{ key: 'svg' }
		) ) as { html: string; url: string };

		// Assert.
		expect( result.url ).toBe( 'https://example.com/fallback.svg' );
		expect( result.html ).toContain( 'fill="currentColor"' );
	} );

	it( 'returns null html when id is set but attachment and url are missing', async () => {
		// Arrange.
		mockedGetMediaAttachment.mockResolvedValue( null as never );

		// Act.
		const result = await svgSrcTransformer( { id: 7, url: null }, { key: 'svg' } );

		// Assert.
		expect( result ).toEqual( { html: null, url: null } );
	} );

	it( 'returns null html when fetch fails', async () => {
		// Arrange.
		mockFetch( '', 'image/svg+xml', false );

		// Act.
		const result = await svgSrcTransformer( { id: null, url: 'https://example.com/missing.svg' }, { key: 'svg' } );

		// Assert.
		expect( result ).toEqual( {
			html: null,
			url: 'https://example.com/missing.svg',
		} );
	} );

	it( 'returns null html when content is not SVG', async () => {
		// Arrange.
		mockFetch( '<html><body>Not SVG</body></html>', 'text/html' );

		// Act.
		const result = await svgSrcTransformer( { id: null, url: 'https://example.com/page.html' }, { key: 'svg' } );

		// Assert.
		expect( result ).toEqual( {
			html: null,
			url: 'https://example.com/page.html',
		} );
	} );

	it( 'merges with existing style attribute', async () => {
		// Arrange.
		const svgWithStyle = '<svg xmlns="http://www.w3.org/2000/svg" style="display: block"><path d="M0 0"/></svg>';
		mockFetch( svgWithStyle );

		// Act.
		const result = ( await svgSrcTransformer(
			{ id: null, url: 'https://example.com/styled.svg' },
			{ key: 'svg' }
		) ) as { html: string; url: string };

		// Assert.
		expect( result.html ).toContain( 'display: block' );
		expect( result.html ).toContain( 'width: 100%' );
	} );

	it( 'returns null html when response has no svg element', async () => {
		// Arrange.
		mockFetch( '<div>Not an SVG</div>' );

		// Act.
		const result = await svgSrcTransformer( { id: null, url: 'https://example.com/not-svg.svg' }, { key: 'svg' } );

		// Assert.
		expect( result ).toEqual( {
			html: null,
			url: 'https://example.com/not-svg.svg',
		} );
	} );

	it( 'passes abort signal to fetch', async () => {
		// Arrange.
		mockFetch( SAMPLE_SVG );
		const controller = new AbortController();

		// Act.
		await svgSrcTransformer(
			{ id: null, url: 'https://example.com/icon.svg' },
			{ key: 'svg', signal: controller.signal }
		);

		// Assert.
		expect( global.fetch ).toHaveBeenCalledWith( 'https://example.com/icon.svg', { signal: controller.signal } );
	} );
} );
