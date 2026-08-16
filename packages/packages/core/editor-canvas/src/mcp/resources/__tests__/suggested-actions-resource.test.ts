import { httpService } from '@elementor/http-client';

import { initSuggestedActionsResource, SUGGESTED_ACTIONS_URI } from '../suggested-actions-resource';

jest.mock( '@elementor/http-client', () => ( {
	httpService: jest.fn(),
} ) );

const mockedHttpService = httpService as jest.MockedFunction< typeof httpService >;

type ResourceContents = { contents: { uri: string; mimeType: string; text: string }[] };
type ResourceHandler = ( uri: URL ) => Promise< ResourceContents >;

const registerResource = () => {
	const resource = jest.fn();
	initSuggestedActionsResource( { resource } as never );
	return resource;
};

describe( 'suggested-actions-resource', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'registers the mcp-app resource with its uri and mime type', () => {
		// Act
		const resource = registerResource();

		// Assert
		const [ name, uri, metadata ] = resource.mock.calls[ 0 ];

		expect( name ).toBe( 'suggested-actions-ui' );
		expect( uri ).toBe( SUGGESTED_ACTIONS_URI );
		expect( metadata.mimeType ).toBe( 'text/html;profile=mcp-app' );
	} );

	it( 'reads the html through the mcp proxy and returns it as resource contents', async () => {
		// Arrange
		const html = '<!DOCTYPE html><html><body>chips</body></html>';
		const get = jest.fn().mockResolvedValue( { data: { data: html } } );
		mockedHttpService.mockReturnValue( { get } as never );

		const handler = registerResource().mock.calls[ 0 ][ 3 ] as ResourceHandler;

		// Act
		const result = await handler( new URL( SUGGESTED_ACTIONS_URI ) );

		// Assert
		expect( get ).toHaveBeenCalledWith( 'elementor/v1/mcp-proxy', {
			params: { uri: SUGGESTED_ACTIONS_URI },
		} );
		expect( result.contents ).toEqual( [
			{
				uri: SUGGESTED_ACTIONS_URI,
				mimeType: 'text/html;profile=mcp-app',
				text: html,
			},
		] );
	} );
} );
