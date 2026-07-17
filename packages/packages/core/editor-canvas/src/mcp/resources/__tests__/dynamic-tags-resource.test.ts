import { httpService } from '@elementor/http-client';

import { DYNAMIC_TAGS_URI, initDynamicTagsResource } from '../dynamic-tags-resource';

jest.mock( '@elementor/http-client', () => ( {
	httpService: jest.fn(),
} ) );

const mockedHttpService = httpService as jest.MockedFunction< typeof httpService >;

type ResourceHandler = ( uri: URL ) => Promise< { contents: { text: string }[] } >;

const captureHandler = (): ResourceHandler => {
	const resource = jest.fn();
	initDynamicTagsResource( { resource } as never );
	return resource.mock.calls[ 0 ][ 3 ] as ResourceHandler;
};

const readCatalog = async () => {
	const handler = captureHandler();
	const result = await handler( new URL( DYNAMIC_TAGS_URI ) );
	return JSON.parse( result.contents[ 0 ].text );
};

describe( 'dynamic-tags-resource', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'returns the flat tag list fetched from the server', async () => {
		// Arrange
		const post = jest.fn().mockResolvedValue( {
			data: {
				data: [
					{
						name: 'post-custom-field',
						label: 'Post Custom Field',
						categories: [ 'text', 'url' ],
						settings: { key: { mocked: true }, before: { mocked: true } },
					},
				],
			},
		} );
		mockedHttpService.mockReturnValue( { post } as never );

		// Act
		const catalog = await readCatalog();

		// Assert
		expect( post ).toHaveBeenCalledWith( 'elementor/v1/mcp-proxy', {
			tool: 'list-dynamic-tags',
			input: {},
		} );
		expect( catalog ).toEqual( [
			{
				name: 'post-custom-field',
				label: 'Post Custom Field',
				categories: [ 'text', 'url' ],
				settings: { key: { mocked: true }, before: { mocked: true } },
			},
		] );
	} );

	it( 'returns an empty list when the server returns no data', async () => {
		// Arrange
		const post = jest.fn().mockResolvedValue( { data: {} } );
		mockedHttpService.mockReturnValue( { post } as never );

		// Act
		const catalog = await readCatalog();

		// Assert
		expect( catalog ).toEqual( [] );
	} );
} );
