export const setupMock = async () => {
	jest.mock( 'elementor-assets-js/modules/imports/module', () => class {
		constructor( args ) {
			this.__construct( args );
		}

		__construct() {}

		trigger() {}
	} );

	global.navigator = {
		userAgent: 'Mock/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
	};

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

	global.localStorage = {
		getItem: () => {},
		setItem: () => {},
		removeItem: () => {},
	};

	global.location = {
		href: 'http://localhost.test:8080/wp-admin/admin.php?page=elementor-web-preview',
		hash: 'test-hash',
	};

	global.window = global;

	global.document = {
		body: {
			classList: {
				add: () => {},
				remove: () => {},
				toggle() {},
			},
		},
	};

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
	delete global.localStorage;
	delete global.location;
	delete global.window;
	delete global._;
	delete global.$e;
};
