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

		const cmd = new Open();
		cmd.apply( {} );

		expect( window.top.location ).toBe( elementorAppConfig.menu_url );
		expect( $e.route ).not.toHaveBeenCalled();
	} );

	it( 'should use the app route when theme_builder_v2 is active', () => {
		elementorCommon.config.allExperimentalFeatures = {
			theme_builder_v2: true,
		};

		const cmd = new Open();
		const args = { url: 'http://example.com/wp-admin/admin.php?page=elementor-app#/site-editor' };
		cmd.apply( args );

		expect( $e.route ).toHaveBeenCalledWith( 'app', args );
		expect( window.top.location ).toBe( '' );
	} );

	it( 'should use the app route when theme_builder_v2 is not registered', () => {
		elementorCommon.config.allExperimentalFeatures = {
			container: true,
		};

		const cmd = new Open();
		const args = { url: 'http://example.com/wp-admin/admin.php?page=elementor-app#/site-editor' };
		cmd.apply( args );

		expect( $e.route ).toHaveBeenCalledWith( 'app', args );
		expect( window.top.location ).toBe( '' );
	} );

	it( 'should navigate full page with the given url when theme_builder_v2 is inactive', () => {
		elementorCommon.config.allExperimentalFeatures = {
			theme_builder_v2: false,
		};

		const legacyUrl = 'http://example.com/wp-admin/admin.php?page=elementor-app#/theme-builder/templates';
		const cmd = new Open();
		cmd.apply( { url: legacyUrl } );

		expect( window.top.location ).toBe( legacyUrl );
		expect( $e.route ).not.toHaveBeenCalled();
	} );
} );
