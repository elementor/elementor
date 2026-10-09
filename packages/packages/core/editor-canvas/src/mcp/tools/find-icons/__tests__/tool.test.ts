import { httpService } from '@elementor/http-client';

import { initFindIconsTool } from '../tool';

jest.mock( '@elementor/http-client', () => ( {
	httpService: jest.fn(),
	AxiosError: class AxiosError extends Error {},
} ) );

const mockedHttpService = httpService as jest.MockedFunction< typeof httpService >;

type ToolConfig = {
	name: string;
	description: string;
	schema: Record< string, unknown >;
	handler: ( input: Record< string, unknown > ) => Promise< Record< string, unknown > >;
};

const captureTool = (): ToolConfig => {
	const addTool = jest.fn();
	initFindIconsTool( { addTool } as never );
	return addTool.mock.calls[ 0 ][ 0 ] as ToolConfig;
};

const serverResponse = {
	results: [
		{
			query: 'add to cart',
			matches: [
				{
					value: 'fa-solid fa-cart-plus',
					library: 'fa-solid',
					name: 'cart-plus',
					label: 'Cart Plus',
					matched_on: 'term',
					license: 'free',
				},
			],
			total: 1,
			page: 1,
			per_page: 10,
			truncated: false,
		},
	],
	libraries: [ 'fa-brands', 'fa-regular', 'fa-solid' ],
	categories: [ 'shopping' ],
	font_awesome_version: '7.3.1',
};

const givenServerResponse = ( data: Record< string, unknown > ) => {
	const post = jest.fn().mockResolvedValue( { data: { data } } );
	mockedHttpService.mockReturnValue( { post } as never );
	return post;
};

describe( 'find-icons tool', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'is registered under a stable name', () => {
		// Act
		const tool = captureTool();

		// Assert
		expect( tool.name ).toBe( 'find-icons' );
	} );

	it( 'tells the agent to copy the value and library verbatim', () => {
		// Act
		const { description } = captureTool();

		// Assert
		expect( description ).toContain( 'e-svg' );
		expect( description ).toContain( 'never assemble those strings yourself' );
		expect( description ).toContain( 'fa-solid fa-cart-shopping' );
	} );

	it( 'proxies a batch of queries to the php ability', async () => {
		// Arrange
		const post = givenServerResponse( serverResponse );
		const { handler } = captureTool();

		// Act
		await handler( { queries: [ 'add to cart', 'free shipping' ] } );

		// Assert
		expect( post ).toHaveBeenCalledWith( 'elementor/v1/mcp-proxy', {
			tool: 'find-icons',
			input: { queries: [ 'add to cart', 'free shipping' ] },
		} );
	} );

	it( 'maps per-page to the snake-cased ability input', async () => {
		// Arrange
		const post = givenServerResponse( serverResponse );
		const { handler } = captureTool();

		// Act
		await handler( { queries: [ 'cart' ], library: 'fa-solid', category: 'shopping', page: 2, perPage: 25 } );

		// Assert
		expect( post ).toHaveBeenCalledWith( 'elementor/v1/mcp-proxy', {
			tool: 'find-icons',
			input: { queries: [ 'cart' ], library: 'fa-solid', category: 'shopping', page: 2, per_page: 25 },
		} );
	} );

	it( 'omits empty filters instead of sending blanks', async () => {
		// Arrange
		const post = givenServerResponse( serverResponse );
		const { handler } = captureTool();

		// Act
		await handler( { category: 'shopping' } );

		// Assert
		expect( post ).toHaveBeenCalledWith( 'elementor/v1/mcp-proxy', {
			tool: 'find-icons',
			input: { category: 'shopping' },
		} );
	} );

	it( 'returns the writable icon pair and the site catalog facets', async () => {
		// Arrange
		givenServerResponse( serverResponse );
		const { handler } = captureTool();

		// Act
		const result = await handler( { queries: [ 'add to cart' ] } );

		// Assert
		expect( result.results ).toEqual( serverResponse.results );
		expect( result.libraries ).toEqual( serverResponse.libraries );
		expect( result.categories ).toEqual( serverResponse.categories );
		expect( result.fontAwesomeVersion ).toBe( '7.3.1' );
	} );

	it( 'forwards the empty-result instruction when nothing matched', async () => {
		// Arrange
		givenServerResponse( {
			...serverResponse,
			results: [ { query: 'nope', matches: [], total: 0, page: 1, per_page: 10, truncated: false } ],
			llm_instructions: 'No icon on this site matches these queries.',
		} );
		const { handler } = captureTool();

		// Act
		const result = await handler( { queries: [ 'nope' ] } );

		// Assert
		expect( result.llmInstructions ).toBe( 'No icon on this site matches these queries.' );
	} );

	it( 'omits the instruction key when something matched', async () => {
		// Arrange
		givenServerResponse( serverResponse );
		const { handler } = captureTool();

		// Act
		const result = await handler( { queries: [ 'add to cart' ] } );

		// Assert
		expect( result ).not.toHaveProperty( 'llmInstructions' );
	} );

	it( 'surfaces a server failure as a tool error', async () => {
		// Arrange
		const post = jest.fn().mockRejectedValue( new Error( 'The icon catalog is missing on this site.' ) );
		mockedHttpService.mockReturnValue( { post } as never );
		const { handler } = captureTool();

		// Act & Assert
		await expect( handler( { queries: [ 'cart' ] } ) ).rejects.toThrow(
			'The icon catalog is missing on this site.'
		);
	} );
} );
