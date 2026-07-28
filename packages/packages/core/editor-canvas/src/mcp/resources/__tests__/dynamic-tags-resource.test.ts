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
	return result.contents[ 0 ].text;
};

describe( 'dynamic-tags-resource', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'returns the json string fetched from the server', async () => {
		// Arrange
		const serverJson = JSON.stringify( [
			{
				name: 'post-custom-field',
				label: 'Post Custom Field',
				categories: [ 'text', 'url' ],
				settings: { key: { mocked: true }, before: { mocked: true } },
			},
		] );

		const get = jest.fn().mockResolvedValue( {
			data: { data: serverJson },
		} );
		mockedHttpService.mockReturnValue( { get } as never );

		// Act
		const text = await readCatalog();

		// Assert
		expect( get ).toHaveBeenCalledWith( 'elementor/v1/mcp-proxy', {
			params: { uri: DYNAMIC_TAGS_URI },
		} );
		expect( text ).toBe( serverJson );
	} );

	it( 'returns an empty json array string when the server returns no data', async () => {
		// Arrange
		const get = jest.fn().mockResolvedValue( { data: {} } );
		mockedHttpService.mockReturnValue( { get } as never );

		// Act
		const text = await readCatalog();

		// Assert
		expect( text ).toBe( '[]' );
	} );
} );
