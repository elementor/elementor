import { GuidedTours } from 'elementor/modules/guided-tours/assets/js/guided-tours';

const TOUR = {
	id: 'admin-navigation',
	version: 2,
	steps: [
		{
			id: 'settings-menu',
			screen: 'dashboard',
			selector: '#menu-settings',
			title: 'Settings',
			description: 'All your site settings live here.',
			side: 'right',
			next_url: 'options-general.php',
		},
		{
			id: 'reading-tab',
			screen: 'options-general',
			selector: '#menu-settings .wp-submenu a',
			title: 'Reading',
			description: 'Each settings area has its own tab.',
			side: 'right',
			next_url: 'options-reading.php',
		},
		{
			id: 'homepage-display',
			screen: 'options-reading',
			selector: '#front-static-pages',
			title: 'Homepage',
			description: 'Choose what visitors see first.',
			side: 'bottom',
		},
		{
			id: 'save-changes',
			screen: 'options-reading',
			selector: '#submit',
			title: 'Save',
			description: 'Do not forget to save your changes.',
			side: 'top',
		},
	],
};

const CONFIG = {
	adminUrl: 'https://example.test/wp-admin/',
	ajax: {
		action: 'elementor_guided_tours_update_progress',
		nonce: 'nonce',
		url: '/wp-admin/admin-ajax.php',
	},
	i18n: {
		next: 'Next',
		progress: '%1$s of %2$s',
	},
	screenId: 'dashboard',
	progress: {},
	tour: TOUR,
};

describe( 'GuidedTours', () => {
	let driver;
	let driverConfig;
	let driverFactory;
	let request;

	beforeEach( () => {
		driver = {
			destroy: jest.fn(),
			drive: jest.fn(),
			getState: jest.fn(),
			getConfig: jest.fn(),
		};
		driverFactory = jest.fn( ( config ) => {
			driverConfig = config;
			driver.getConfig.mockImplementation( ( key ) => ( 'steps' === key ? config.steps : undefined ) );
			driver.getState.mockImplementation( ( key ) => ( 'activeIndex' === key ? 0 : undefined ) );
			return driver;
		} );
		request = jest.fn().mockResolvedValue( {} );
		document.documentElement.dir = 'ltr';
		delete window.location;
		window.location = { assign: jest.fn() };
	} );

	it( 'resumes from the stored step on the matching screen', () => {
		// Arrange.
		const guidedTours = new GuidedTours( {
			...CONFIG,
			screenId: 'options-reading',
			progress: {
				status: 'in_progress',
				step_id: 'save-changes',
				version: 2,
			},
		}, driverFactory, request );

		// Act.
		guidedTours.init();

		// Assert.
		expect( driver.drive ).toHaveBeenCalledWith( 1 );
	} );

	it( 'resumes the next screen step when progress was saved on the previous screen', () => {
		// Arrange.
		const guidedTours = new GuidedTours( {
			...CONFIG,
			screenId: 'options-general',
			progress: {
				status: 'in_progress',
				step_id: 'settings-menu',
				version: 2,
			},
		}, driverFactory, request );

		// Act.
		guidedTours.init();

		// Assert.
		expect( driver.drive ).toHaveBeenCalledWith( 0 );
	} );

	it( 'does not start when no step matches the current screen', () => {
		// Arrange.
		const guidedTours = new GuidedTours( {
			...CONFIG,
			screenId: 'plugins',
			progress: {
				status: 'in_progress',
				step_id: 'settings-menu',
				version: 2,
			},
		}, driverFactory, request );

		// Act.
		guidedTours.init();

		// Assert.
		expect( driverFactory ).not.toHaveBeenCalled();
	} );

	it( 'does not start a dismissed tour', () => {
		// Arrange.
		const guidedTours = new GuidedTours( {
			...CONFIG,
			progress: {
				status: 'dismissed',
				step_id: 'settings-menu',
				version: 2,
			},
		}, driverFactory, request );

		// Act.
		guidedTours.init();

		// Assert.
		expect( driverFactory ).not.toHaveBeenCalled();
	} );

	it( 'does not start a completed tour', () => {
		// Arrange.
		const guidedTours = new GuidedTours( {
			...CONFIG,
			progress: {
				status: 'completed',
				step_id: 'save-changes',
				version: 2,
			},
		}, driverFactory, request );

		// Act.
		guidedTours.init();

		// Assert.
		expect( driverFactory ).not.toHaveBeenCalled();
	} );

	it( 'mirrors horizontal popover placement in RTL', () => {
		// Arrange.
		document.documentElement.dir = 'rtl';
		const guidedTours = new GuidedTours( CONFIG, driverFactory, request );

		// Act.
		guidedTours.init();

		// Assert.
		expect( driverConfig.steps[ 0 ].popover.side ).toBe( 'left' );
	} );

	it( 'navigates on done click when a single-screen step is not the tour last', async () => {
		// Arrange.
		const guidedTours = new GuidedTours( {
			...CONFIG,
			screenId: 'options-general',
			progress: {
				status: 'in_progress',
				step_id: 'reading-tab',
				version: 2,
			},
		}, driverFactory, request );
		guidedTours.init();

		// Act.
		driverConfig.onDoneClick();
		await guidedTours.progressRequest;

		// Assert.
		const body = request.mock.calls[ 0 ][ 1 ].body;
		expect( body.get( 'stepId' ) ).toBe( 'homepage-display' );
		expect( window.location.assign ).toHaveBeenCalledWith(
			'https://example.test/wp-admin/options-reading.php'
		);
	} );

	it( 'stores the next step and navigates when next_url is used', async () => {
		// Arrange.
		const guidedTours = new GuidedTours( CONFIG, driverFactory, request );
		guidedTours.init();

		// Act.
		driverConfig.onNextClick( null, driverConfig.steps[ 0 ], { driver } );
		await guidedTours.progressRequest;

		// Assert.
		const body = request.mock.calls[ 0 ][ 1 ].body;
		expect( body.get( 'stepId' ) ).toBe( 'reading-tab' );
		expect( window.location.assign ).toHaveBeenCalledWith(
			'https://example.test/wp-admin/options-general.php'
		);
	} );

	it( 'marks completion on the last step done click', async () => {
		// Arrange.
		const guidedTours = new GuidedTours( {
			...CONFIG,
			screenId: 'options-reading',
			progress: {
				status: 'in_progress',
				step_id: 'save-changes',
				version: 2,
			},
		}, driverFactory, request );
		guidedTours.init();

		// Act.
		driver.getState.mockReturnValue( 1 );
		driverConfig.onDoneClick();
		await guidedTours.progressRequest;

		// Assert.
		const body = request.mock.calls[ 0 ][ 1 ].body;
		expect( body.get( 'status' ) ).toBe( 'completed' );
		expect( body.get( 'stepId' ) ).toBe( 'save-changes' );
		expect( driver.destroy ).toHaveBeenCalled();
	} );

	it( 'saves dismissed progress when the tour is closed', async () => {
		// Arrange.
		const guidedTours = new GuidedTours( CONFIG, driverFactory, request );
		guidedTours.init();

		// Act.
		driverConfig.onDestroyed( null, { data: { id: 'settings-menu' } }, { reason: 'close' } );
		await guidedTours.progressRequest;

		// Assert.
		const body = request.mock.calls[ 0 ][ 1 ].body;
		expect( body.get( 'status' ) ).toBe( 'dismissed' );
		expect( body.get( 'stepId' ) ).toBe( 'settings-menu' );
	} );

	it( 'serializes progress updates', async () => {
		// Arrange.
		let resolveFirstRequest;
		request
			.mockImplementationOnce( () => new Promise( ( resolve ) => {
				resolveFirstRequest = resolve;
			} ) )
			.mockResolvedValueOnce( {} );
		const guidedTours = new GuidedTours( CONFIG, driverFactory, request );
		guidedTours.init();

		// Act.
		driverConfig.onHighlighted( null, driverConfig.steps[ 0 ] );
		await Promise.resolve();

		// Assert.
		expect( request ).toHaveBeenCalledTimes( 1 );

		// Act.
		resolveFirstRequest( {} );
		await guidedTours.progressRequest;
		driverConfig.onHighlighted( null, { data: { id: 'settings-menu' } } );
		await guidedTours.progressRequest;

		// Assert.
		expect( request ).toHaveBeenCalledTimes( 2 );
	} );
} );
