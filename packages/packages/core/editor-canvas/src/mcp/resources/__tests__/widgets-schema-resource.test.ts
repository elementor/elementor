import { httpService } from '@elementor/http-client';

jest.mock( '@elementor/http-client', () => ( {
	httpService: jest.fn(),
} ) );

jest.mock( '@elementor/editor-mcp', () => {
	class MockResourceTemplate {
		callbacks: { list?: () => Promise< { resources: unknown[] } > };
		constructor( _uriTemplate: string, callbacks: { list?: () => Promise< { resources: unknown[] } > } ) {
			this.callbacks = callbacks;
		}
	}
	return { ResourceTemplate: MockResourceTemplate };
} );

import { initWidgetsSchemaResource, WIDGET_SCHEMA_URI } from '../widgets-schema-resource';

const mockedHttpService = httpService as jest.MockedFunction< typeof httpService >;

type ResourceTemplateHandler = (
	uri: URL,
	variables: Record< string, string >
) => Promise< { contents: { text: string }[] } >;
type ResourceTemplateLike = { callbacks: { list?: () => Promise< { resources: unknown[] } > } };

const captureHandlers = () => {
	const resource = jest.fn();
	initWidgetsSchemaResource( { resource } as never );
	const call = resource.mock.calls[ 0 ];
	const template = call[ 1 ] as ResourceTemplateLike;
	return {
		list: template.callbacks.list as () => Promise< { resources: unknown[] } >,
		readHandler: call[ 3 ] as ResourceTemplateHandler,
	};
};

describe( 'widgets-schema-resource', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'lists widget types fetched from the server via the list-widgets tool', async () => {
		// Arrange
		const post = jest.fn().mockResolvedValue( {
			data: {
				data: [
					{ type: 'e-heading', version: 'v4' },
					{ type: 'e-button', version: 'v4' },
				],
			},
		} );
		mockedHttpService.mockReturnValue( { post } as never );
		const { list } = captureHandlers();

		// Act
		const result = await list();

		// Assert
		expect( post ).toHaveBeenCalledWith( 'elementor/v1/mcp-proxy', { tool: 'list-widgets', input: {} } );
		expect( result.resources ).toEqual( [
			{ uri: 'elementor://widgets/schema/e-heading', name: 'Widget schema for e-heading' },
			{ uri: 'elementor://widgets/schema/e-button', name: 'Widget schema for e-button' },
		] );
	} );

	it( 'reads a single widget schema via the get-widget-schema tool', async () => {
		// Arrange
		const post = jest.fn().mockResolvedValue( {
			data: { data: { type: 'object', properties: { text: { mocked: true } } } },
		} );
		mockedHttpService.mockReturnValue( { post } as never );
		const { readHandler } = captureHandlers();
		const uri = new URL( 'elementor://widgets/schema/e-heading' );

		// Act
		const result = await readHandler( uri, { widgetType: 'e-heading' } );

		// Assert
		expect( post ).toHaveBeenCalledWith( 'elementor/v1/mcp-proxy', {
			tool: 'get-widget-schema',
			input: { widget_type: 'e-heading' },
		} );
		expect( JSON.parse( result.contents[ 0 ].text ) ).toEqual( {
			type: 'object',
			properties: { text: { mocked: true } },
		} );
	} );

	it( 'throws when no widget type variable is provided', async () => {
		// Arrange
		const { readHandler } = captureHandlers();
		const uri = new URL( WIDGET_SCHEMA_URI.replace( '{widgetType}', '' ) );

		// Act & Assert
		await expect( readHandler( uri, {} ) ).rejects.toThrow( 'No widget type provided.' );
	} );
} );
