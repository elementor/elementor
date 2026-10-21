import { registerTools, runTool } from 'elementor/modules/agents/assets/js/frontend/webmcp-tools';

const RUN_URL = 'https://example.com/wp-json/elementor/v1/agents/webmcp/run';

const config = {
	runUrl: RUN_URL,
	tools: [
		{ name: 'search_site_content', description: 'Search', inputSchema: { type: 'object' } },
		{ name: 'get_site_structure', description: 'Structure', inputSchema: { type: 'object' } },
	],
};

describe( 'WebMCP browser tools', () => {
	afterEach( () => {
		delete global.fetch;
	} );

	it( 'registers every localized tool with the model context', () => {
		// Arrange
		const registerTool = jest.fn();

		// Act
		registerTools( { registerTool }, config );

		// Assert
		expect( registerTool ).toHaveBeenCalledTimes( 2 );
		expect( registerTool.mock.calls[ 0 ][ 0 ].name ).toBe( 'search_site_content' );
		expect( registerTool.mock.calls[ 0 ][ 0 ].annotations ).toEqual( { readOnlyHint: true } );
	} );

	it( 'keeps registering tools when one registration fails', () => {
		// Arrange
		const registerTool = jest.fn()
			.mockImplementationOnce( () => {
				throw new Error( 'Duplicate tool name' );
			} );

		// Act
		registerTools( { registerTool }, config );

		// Assert
		expect( registerTool ).toHaveBeenCalledTimes( 2 );
		expect( registerTool.mock.calls[ 1 ][ 0 ].name ).toBe( 'get_site_structure' );
	} );

	it( 'does nothing when the browser has no model context', () => {
		// Act & Assert
		expect( () => registerTools( undefined, config ) ).not.toThrow();
	} );

	it( 'calls the run route anonymously and returns the JSON text', async () => {
		// Arrange
		global.fetch = jest.fn( () => Promise.resolve( { ok: true, json: () => Promise.resolve( { results: [] } ) } ) );

		// Act
		const result = await runTool( RUN_URL, 'search_site_content', { query: 'shoes' } );

		// Assert
		expect( global.fetch ).toHaveBeenCalledWith( RUN_URL, expect.objectContaining( {
			method: 'POST',
			credentials: 'omit',
			body: JSON.stringify( { tool: 'search_site_content', input: { query: 'shoes' } } ),
		} ) );
		expect( result ).toEqual( { content: [ { type: 'text', text: '{"results":[]}' } ], isError: false } );
	} );

	it( 'flags failed responses as errors', async () => {
		// Arrange
		global.fetch = jest.fn( () => Promise.resolve( { ok: false, json: () => Promise.resolve( { code: 'webmcp_not_found' } ) } ) );

		// Act
		const result = await runTool( RUN_URL, 'missing', {} );

		// Assert
		expect( result.isError ).toBe( true );
	} );

	it( 'returns an error result when the response is not JSON', async () => {
		// Arrange
		global.fetch = jest.fn( () => Promise.resolve( {
			ok: false,
			json: () => Promise.reject( new SyntaxError( 'Unexpected token <' ) ),
		} ) );

		// Act
		const result = await runTool( RUN_URL, 'search_site_content', {} );

		// Assert
		expect( result.isError ).toBe( true );
		expect( result.content[ 0 ].text ).toContain( 'Unexpected token <' );
	} );
} );
