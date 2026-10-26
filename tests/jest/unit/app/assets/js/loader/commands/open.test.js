describe( 'app/open command', () => {
	let Open;

	beforeEach( async () => {
		global.$e = {
			route: jest.fn(),
			modules: {
				CommandBase: class CommandBase {},
			},
		};

		global.elementorAppConfig = {
			menu_url: 'http://example.com/wp-admin/admin.php?page=elementor-app#/theme-builder',
		};

		global.elementorCommon = {
			config: {},
		};

		delete window.top.location;
		window.top.location = '';

		Open = ( await import( 'elementor/app/assets/js/loader/commands/open' ) ).Open;
	} );

	afterEach( () => {
		delete global.$e;
		delete global.elementorAppConfig;
		delete global.elementorCommon;
		jest.resetModules();
		jest.clearAllMocks();
	} );

	it( 'should navigate full page when theme_builder_v2 is registered and inactive', () => {
		elementorCommon.config.allExperimentalFeatures = {
			theme_builder_v2: false,
		};

		new Open().apply( {} );

		expect( window.top.location ).toBe( elementorAppConfig.menu_url );
		expect( $e.route ).not.toHaveBeenCalled();
	} );

	it( 'should use the app route when theme_builder_v2 is active', () => {
		elementorCommon.config.allExperimentalFeatures = {
			theme_builder_v2: true,
		};

		const args = { url: 'http://example.com/wp-admin/admin.php?page=elementor-app#/site-editor' };
		new Open().apply( args );

		expect( $e.route ).toHaveBeenCalledWith( 'app', args );
		expect( window.top.location ).toBe( '' );
	} );

	it( 'should use the app route when theme_builder_v2 is not registered', () => {
		elementorCommon.config.allExperimentalFeatures = {
			container: true,
		};

		const args = { url: 'http://example.com/wp-admin/admin.php?page=elementor-app#/site-editor' };
		new Open().apply( args );

		expect( $e.route ).toHaveBeenCalledWith( 'app', args );
		expect( window.top.location ).toBe( '' );
	} );

	it( 'should use the app route for non-site-editor app urls when theme_builder_v2 is inactive', () => {
		elementorCommon.config.allExperimentalFeatures = {
			theme_builder_v2: false,
		};

		const args = { url: 'http://example.com/wp-admin/admin.php?page=elementor-app&source=finder#/kit-library' };
		new Open().apply( args );

		expect( $e.route ).toHaveBeenCalledWith( 'app', args );
		expect( window.top.location ).toBe( '' );
	} );
} );
