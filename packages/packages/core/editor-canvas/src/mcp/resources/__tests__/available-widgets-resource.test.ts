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

	it( 'fetches all widgets via list-widget-schemas with summary=true', async () => {
		// Arrange
		const post = jest.fn().mockResolvedValue( {
			data: {
				data: {
					widgets: [
						{ type: 'e-heading', description: 'A heading widget' },
						{ type: 'e-button', description: 'A button widget' },
					],
				},
			},
		} );
		mockedHttpService.mockReturnValue( { post } as never );
		const { allHandler } = captureHandlers();

		// Act
		const result = await allHandler();

		// Assert
		expect( post ).toHaveBeenCalledWith( 'elementor/v1/mcp-proxy', {
			tool: 'list-widget-schemas',
			input: { summary: true },
		} );
		expect( JSON.parse( result.contents[ 0 ].text ) ).toEqual( [
			{ type: 'e-heading', description: 'A heading widget' },
			{ type: 'e-button', description: 'A button widget' },
		] );
	} );

	it( 'fetches v4 widgets via list-widget-schemas with summary=true', async () => {
		// Arrange
		const post = jest.fn().mockResolvedValue( {
			data: { data: { widgets: [ { type: 'e-heading', description: 'A heading widget' } ] } },
		} );
		mockedHttpService.mockReturnValue( { post } as never );
		const { v4Handler } = captureHandlers();

		// Act
		const result = await v4Handler();

		// Assert
		expect( post ).toHaveBeenCalledWith( 'elementor/v1/mcp-proxy', {
			tool: 'list-widget-schemas',
			input: { summary: true },
		} );
		expect( JSON.parse( result.contents[ 0 ].text ) ).toEqual( [
			{ type: 'e-heading', description: 'A heading widget' },
		] );
	} );

	it( 'exposes the expected resource URIs', () => {
		expect( AVAILABLE_WIDGETS_URI ).toBe( 'elementor://context/available-widgets' );
		expect( AVAILABLE_WIDGETS_URI_V4 ).toBe( 'elementor://context/available-widgets/v4' );
	} );
} );
