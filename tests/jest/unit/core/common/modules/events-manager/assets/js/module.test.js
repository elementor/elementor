const mockTrack = jest.fn();
const mockMixpanelInstance = {
	isInitialized: true,
	get_distinct_id: () => 'test-id',
	register: jest.fn(),
	identify: jest.fn(),
	people: { set_once: jest.fn() },
	track: mockTrack,
};

jest.mock( 'mixpanel-browser', () => ( {
	__esModule: true,
	default: {
		init: jest.fn( ( token, config ) => {
			if ( config.loaded ) {
				config.loaded( mockMixpanelInstance );
			}

			return mockMixpanelInstance;
		} ),
	},
	Mixpanel: {},
} ) );

describe( 'Events Manager module', () => {
	beforeEach( () => {
		jest.resetModules();
		mockTrack.mockReset();

		window.elementorCommon = {
			config: {
				editor_events: {
					can_send_events: true,
					user_id: 'user-1',
					site_url: 'https://example.com',
					wp_version: '6.0',
					site_key: 'key',
					elementor_version: '3.0',
					site_language: 'en',
				},
				library_connect: {
					user_roles: [ 'administrator' ],
					current_access_tier: 'free',
					plan_type: 'free',
				},
				experimentalFeatures: {},
			},
		};
	} );

	afterEach( () => {
		delete window.elementorCommon;
	} );

	test( 'dispatchEvent does not throw when event dispatch fails', () => {
		mockTrack.mockImplementation( () => {
			throw new Error( 'event dispatch failure' );
		} );

		jest.isolateModules( () => {
			const EventsManager = require( 'elementor/core/common/modules/events-manager/assets/js/module' ).default;
			const eventsManager = new EventsManager();

			eventsManager.onInit();

			expect( () => eventsManager.dispatchEvent( 'test_event', { foo: 'bar' } ) ).not.toThrow();
		} );
	} );

	test( 'dispatchEvent calls mixpanel track when tracking is enabled', () => {
		jest.isolateModules( () => {
			const EventsManager = require( 'elementor/core/common/modules/events-manager/assets/js/module' ).default;
			const eventsManager = new EventsManager();

			eventsManager.onInit();
			eventsManager.dispatchEvent( 'test_event', { foo: 'bar' } );

			expect( mockTrack ).toHaveBeenCalledWith(
				'test_event',
				expect.objectContaining( { foo: 'bar' } ),
				{},
			);
		} );
	} );
} );
