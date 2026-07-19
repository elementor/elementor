import { httpService } from '@elementor/http-client';

import {
	AVAILABLE_WIDGETS_URI,
	AVAILABLE_WIDGETS_URI_V4,
	initAvailableWidgetsResource,
} from '../available-widgets-resource';

jest.mock( '@elementor/http-client', () => ( {
	httpService: jest.fn(),
} ) );

const mockedHttpService = httpService as jest.MockedFunction< typeof httpService >;

type ResourceHandler = () => Promise< { contents: { text: string }[] } >;

const captureHandlers = () => {
	const resource = jest.fn();
	initAvailableWidgetsResource( { resource } as never );
	return {
		v4Handler: resource.mock.calls[ 0 ][ 3 ] as ResourceHandler,
		allHandler: resource.mock.calls[ 1 ][ 3 ] as ResourceHandler,
	};
};

describe( 'available-widgets-resource', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'fetches all widgets via list-widgets without a version filter', async () => {
		// Arrange
		const post = jest.fn().mockResolvedValue( {
			data: {
				data: [
					{ type: 'e-heading', version: 'v4' },
					{ type: 'legacy-icon', version: 'v3' },
				],
			},
		} );
		mockedHttpService.mockReturnValue( { post } as never );
		const { allHandler } = captureHandlers();

		// Act
		const result = await allHandler();

		// Assert
		expect( post ).toHaveBeenCalledWith( 'elementor/v1/mcp-proxy', { tool: 'list-widgets', input: {} } );
		expect( JSON.parse( result.contents[ 0 ].text ) ).toEqual( [
			{ type: 'e-heading', version: 'v4' },
			{ type: 'legacy-icon', version: 'v3' },
		] );
	} );

	it( 'fetches only v4 widgets via list-widgets with a version filter', async () => {
		// Arrange
		const post = jest.fn().mockResolvedValue( { data: { data: [ { type: 'e-heading', version: 'v4' } ] } } );
		mockedHttpService.mockReturnValue( { post } as never );
		const { v4Handler } = captureHandlers();

		// Act
		const result = await v4Handler();

		// Assert
		expect( post ).toHaveBeenCalledWith( 'elementor/v1/mcp-proxy', {
			tool: 'list-widgets',
			input: { version: 'v4' },
		} );
		expect( JSON.parse( result.contents[ 0 ].text ) ).toEqual( [ { type: 'e-heading', version: 'v4' } ] );
	} );

	it( 'exposes the expected resource URIs', () => {
		expect( AVAILABLE_WIDGETS_URI ).toBe( 'elementor://context/available-widgets' );
		expect( AVAILABLE_WIDGETS_URI_V4 ).toBe( 'elementor://context/available-widgets/v4' );
	} );
} );
