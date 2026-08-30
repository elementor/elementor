const MCP_INTERACTION_EVENT = 'elementor/mcp/interaction';
const REGISTRAR_PATH = '../../../../../../../../modules/mcp/assets/dev/js/mcp-analytics-registrar';

describe( 'mcp-analytics-registrar', () => {
	afterEach( () => {
		delete window.elementorCommon;
		jest.resetModules();
	} );

	test( 'does not throw when elementorCommon is missing', () => {
		delete window.elementorCommon;

		jest.isolateModules( () => {
			expect( () => require( REGISTRAR_PATH ) ).not.toThrow();
		} );
	} );

	test( 'dispatches mapped MCP events to elementorCommon.eventsManager', () => {
		const dispatchEvent = jest.fn();

		window.elementorCommon = {
			eventsManager: {
				dispatchEvent,
			},
		};

		jest.isolateModules( () => {
			require( REGISTRAR_PATH );

			window.dispatchEvent(
				new CustomEvent( MCP_INTERACTION_EVENT, {
					detail: {
						name: 'viewed',
						client: 'cursor',
						mode: 'auto',
					},
				} ),
			);
		} );

		expect( dispatchEvent ).toHaveBeenCalledWith(
			'mcp_connection_page_viewed',
			expect.objectContaining( {
				app_type: 'wpadmin',
				interaction_result: 'page_loaded',
				client: 'cursor',
				mode: 'auto',
			} ),
		);
	} );

	test( 'ignores interaction events without a name', () => {
		const dispatchEvent = jest.fn();

		window.elementorCommon = {
			eventsManager: {
				dispatchEvent,
			},
		};

		jest.isolateModules( () => {
			require( REGISTRAR_PATH );

			window.dispatchEvent(
				new CustomEvent( MCP_INTERACTION_EVENT, {
					detail: {},
				} ),
			);
		} );

		expect( dispatchEvent ).not.toHaveBeenCalled();
	} );
} );
