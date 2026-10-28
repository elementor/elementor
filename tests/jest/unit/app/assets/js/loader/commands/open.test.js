describe( 'app/open command', () => {
	let Open;
	let locationHref;

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

		locationHref = '';
		Object.defineProperty( window.top, 'location', {
			configurable: true,
			value: {
				set href( value ) {
					locationHref = value;
				},
				get href() {
					return locationHref;
				},
			},
		} );

		Open = ( await import( 'elementor/app/assets/js/loader/commands/open' ) ).Open;
	} );

	afterEach( () => {
		delete global.$e;
		delete global.elementorAppConfig;
		delete global.elementorCommon;
		jest.resetModules();
		jest.clearAllMocks();
	} );

	it( 'should navigate full page to menu_url when theme_builder_v2 is registered and inactive', () => {
		elementorCommon.config.allExperimentalFeatures = {
			theme_builder_v2: false,
		};

		new Open().apply( {} );

		expect( locationHref ).toBe( elementorAppConfig.menu_url );
		expect( $e.route ).not.toHaveBeenCalled();
	} );

	it( 'should use the app route when theme_builder_v2 is active', () => {
		elementorCommon.config.allExperimentalFeatures = {
			theme_builder_v2: true,
		};

		const args = { url: 'http://example.com/wp-admin/admin.php?page=elementor-app#/site-editor' };
		new Open().apply( args );

		expect( $e.route ).toHaveBeenCalledWith( 'app', args );
		expect( locationHref ).toBe( '' );
	} );

	it( 'should use the app route when theme_builder_v2 is not registered', () => {
		elementorCommon.config.allExperimentalFeatures = {
			container: true,
		};

		const args = { url: 'http://example.com/wp-admin/admin.php?page=elementor-app#/site-editor' };
		new Open().apply( args );

		expect( $e.route ).toHaveBeenCalledWith( 'app', args );
		expect( locationHref ).toBe( '' );
	} );

	it( 'should use the app route when menu_url is missing or not a string', () => {
		elementorCommon.config.allExperimentalFeatures = {
			theme_builder_v2: false,
		};

		elementorAppConfig.menu_url = undefined;
		new Open().apply( {} );
		expect( $e.route ).toHaveBeenCalledWith( 'app', {} );
		expect( locationHref ).toBe( '' );

		$e.route.mockClear();
		elementorAppConfig.menu_url = null;
		new Open().apply( {} );
		expect( $e.route ).toHaveBeenCalledWith( 'app', {} );
		expect( locationHref ).toBe( '' );
	} );

	it( 'should use the app route for non-site-editor app urls when theme_builder_v2 is inactive', () => {
		elementorCommon.config.allExperimentalFeatures = {
			theme_builder_v2: false,
		};

		const args = { url: 'http://example.com/wp-admin/admin.php?page=elementor-app&source=finder#/kit-library' };
		new Open().apply( args );

		expect( $e.route ).toHaveBeenCalledWith( 'app', args );
		expect( locationHref ).toBe( '' );
	} );

	it.each( [
		'javascript:alert(1)',
		'//evil.com',
		'https://site.com@evil.com/?page=elementor-app#/site-editor',
	] )( 'should never assign args.url to window.top.location (%s)', ( maliciousUrl ) => {
		elementorCommon.config.allExperimentalFeatures = {
			theme_builder_v2: false,
		};

		new Open().apply( { url: maliciousUrl } );

		expect( locationHref ).not.toBe( maliciousUrl );
		if ( maliciousUrl.includes( 'site-editor' ) && maliciousUrl.includes( 'page=elementor-app' ) ) {
			expect( locationHref ).toBe( elementorAppConfig.menu_url );
		} else {
			expect( locationHref ).toBe( '' );
		}
	} );
} );
