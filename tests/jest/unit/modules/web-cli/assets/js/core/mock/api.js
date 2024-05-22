export const setupMock = async () => {
	jest.mock( 'elementor-assets-js/modules/imports/module', () => class {
		constructor( args ) {
			this.__construct( args );
		}

		__construct() {}

		trigger() {}
	} );

	jest.mock( 'elementor-api/utils/deprecation', () => ( {
		deprecated: jest.fn(),
	} ) );

	global.jQuery = () => {
		return {
			on: () => {},
			off: () => {},
			trigger: () => {},
		};
	};

	global.elementorWebCliConfig = {
		urls: {
			rest: 'http://localhost.test:8080/wp-json/',
		},
	};

	if ( ! global.location ) {
		global.location = {};
	}
	global.location.href = 'http://localhost.test:8080/wp-admin/admin.php?page=elementor-web-preview';
	global.location.hash = 'test-hash';

	if ( ! global.window ) {
		global.window = global;
	}

	global._ = {
		isEqual: ( a, b ) => a === b,
	};

	global.$e = new ( await import( 'elementor-api/api' ) ).default;
	return $e;
};

export const freeMock = () => {
	jest.unmock( 'elementor-assets-js/modules/imports/module' );

	delete global.navigator;
	delete global.jQuery;
	delete global.elementorWebCliConfig;
	delete global.location;
	delete global.window;
	delete global._;
	delete global.$e;
};
