/* eslint-disable testing-library/render-result-naming-convention */
import { fetchRenderedHtml } from '../fetch-rendered-html';

describe( 'fetchRenderedHtml', () => {
	const originalFetch = global.fetch;

	afterEach( () => {
		global.fetch = originalFetch;
	} );

	it( 'returns null without calling fetch when url is null', async () => {
		// Arrange.
		const fetchMock = jest.fn();
		global.fetch = fetchMock as unknown as typeof fetch;

		// Act.
		const pageHtml = await fetchRenderedHtml( null );

		// Assert.
		expect( pageHtml ).toBeNull();
		expect( fetchMock ).not.toHaveBeenCalled();
	} );

	it( 'fetches the page as an anonymous visitor by omitting credentials', async () => {
		// Arrange.
		const fetchMock = jest.fn().mockResolvedValue( {
			ok: true,
			text: () => Promise.resolve( '<html></html>' ),
		} );
		global.fetch = fetchMock as unknown as typeof fetch;

		// Act.
		await fetchRenderedHtml( 'https://example.com/hello' );

		// Assert.
		expect( fetchMock ).toHaveBeenCalledWith( 'https://example.com/hello', { credentials: 'omit' } );
	} );

	it( 'returns the response text when the request succeeds', async () => {
		// Arrange.
		global.fetch = jest.fn().mockResolvedValue( {
			ok: true,
			text: () => Promise.resolve( '<html>page</html>' ),
		} ) as unknown as typeof fetch;

		// Act.
		const pageHtml = await fetchRenderedHtml( 'https://example.com/hello' );

		// Assert.
		expect( pageHtml ).toBe( '<html>page</html>' );
	} );

	it( 'returns null when the response is not ok', async () => {
		// Arrange.
		global.fetch = jest.fn().mockResolvedValue( {
			ok: false,
			text: () => Promise.resolve( '' ),
		} ) as unknown as typeof fetch;

		// Act.
		const pageHtml = await fetchRenderedHtml( 'https://example.com/hello' );

		// Assert.
		expect( pageHtml ).toBeNull();
	} );

	it( 'returns null when fetch throws', async () => {
		// Arrange.
		global.fetch = jest.fn().mockRejectedValue( new Error( 'network down' ) ) as unknown as typeof fetch;

		// Act.
		const pageHtml = await fetchRenderedHtml( 'https://example.com/hello' );

		// Assert.
		expect( pageHtml ).toBeNull();
	} );
} );
