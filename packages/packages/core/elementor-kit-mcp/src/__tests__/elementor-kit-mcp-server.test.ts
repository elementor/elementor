const mockCallWpApi = jest.fn();
const mockWaitForReady = jest.fn();
const mockRegisterLocalServer = jest.fn();
const mockRegisterResource = jest.fn();
const mockRegisterTool = jest.fn();

jest.mock( '@elementor/elementor-mcp-common', () => ( {
	callWpApi: ( ...args: unknown[] ) => mockCallWpApi( ...args ),
	requireConfirmationMessage: jest.fn(),
	waitForElementorEditor: jest.fn().mockResolvedValue( undefined ),
} ) );

jest.mock( '@elementor/editor-mcp', () => {
	class MockResourceTemplate {
		uriTemplate: string;
		callbacks: { list?: () => Promise< unknown > };
		constructor( uriTemplate: string, callbacks: { list?: () => Promise< unknown > } ) {
			this.uriTemplate = uriTemplate;
			this.callbacks = callbacks;
		}
	}
	class MockMcpServer {
		registerResource = ( ...args: unknown[] ) => mockRegisterResource( ...args );
		registerTool = ( ...args: unknown[] ) => mockRegisterTool( ...args );
	}
	return {
		getAngieSdk: () => ( {
			waitForReady: mockWaitForReady,
			registerLocalServer: mockRegisterLocalServer,
		} ),
		McpServer: MockMcpServer,
		ResourceTemplate: MockResourceTemplate,
	};
} );

const SCHEMA_ENDPOINT = '/angie/v1/elementor-kit/schema';

describe( 'createElementorKitServer', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockWaitForReady.mockResolvedValue( undefined );
		mockCallWpApi.mockResolvedValue( { data: {} } );
	} );

	it( 'does not fetch the kit schema during server construction (avoids 404 when Angie is inactive)', async () => {
		const { createElementorKitServer } = await import( '../elementor-kit-mcp-server' );

		await createElementorKitServer();

		const schemaCalls = mockCallWpApi.mock.calls.filter( ( call ) => call[ 0 ] === SCHEMA_ENDPOINT );
		expect( schemaCalls ).toHaveLength( 0 );
	} );

	it( 'fetches the kit schema lazily, only when the schema resources are listed', async () => {
		const { createElementorKitServer } = await import( '../elementor-kit-mcp-server' );

		await createElementorKitServer();

		const schemaResourceCall = mockRegisterResource.mock.calls.find(
			( call ) => call[ 0 ] === 'elementor-kit-schema'
		);
		expect( schemaResourceCall ).toBeDefined();

		// Still not fetched right after construction.
		expect( mockCallWpApi ).not.toHaveBeenCalledWith( SCHEMA_ENDPOINT, 'GET' );

		const template = schemaResourceCall?.[ 1 ] as { callbacks: { list: () => Promise< unknown > } };
		await template.callbacks.list();

		// The schema is fetched only once a client lists the resources.
		expect( mockCallWpApi ).toHaveBeenCalledWith( SCHEMA_ENDPOINT, 'GET' );
	} );
} );
