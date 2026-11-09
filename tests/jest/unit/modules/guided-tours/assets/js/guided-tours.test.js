import { GuidedTours } from 'elementor/modules/guided-tours/assets/js/guided-tours';

const TOUR = {
	id: 'admin-navigation',
	version: 1,
	steps: [
		{
			id: 'dashboard',
			selector: '#menu-dashboard',
			title: 'Dashboard',
			description: 'Start here.',
			side: 'right',
		},
		{
			id: 'posts',
			selector: '#menu-posts',
			title: 'Posts',
			description: 'Manage posts.',
			side: 'right',
		},
	],
};

const CONFIG = {
	ajax: {
		action: 'elementor_guided_tours_update_progress',
		nonce: 'nonce',
		url: '/wp-admin/admin-ajax.php',
	},
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
			drive: jest.fn(),
		};
		driverFactory = jest.fn( ( config ) => {
			driverConfig = config;
			return driver;
		} );
		request = jest.fn().mockResolvedValue( {} );
		document.documentElement.dir = 'ltr';
	} );

	it( 'resumes from the stored step', () => {
		// Arrange.
		const guidedTours = new GuidedTours( {
			...CONFIG,
			progress: {
				status: 'in_progress',
				step_id: 'posts',
				version: 1,
			},
		}, driverFactory, request );

		// Act.
		guidedTours.init();

		// Assert.
		expect( driver.drive ).toHaveBeenCalledWith( 1 );
	} );

	it( 'does not start a completed tour', () => {
		// Arrange.
		const guidedTours = new GuidedTours( {
			...CONFIG,
			progress: {
				status: 'completed',
				step_id: 'posts',
				version: 1,
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

	it( 'stores completion when the last step is done', async () => {
		// Arrange.
		const guidedTours = new GuidedTours( CONFIG, driverFactory, request );
		guidedTours.init();

		// Act.
		driverConfig.onDestroyed( null, driverConfig.steps[ 1 ], { reason: 'done' } );
		await guidedTours.progressRequest;

		// Assert.
		const body = request.mock.calls[ 0 ][ 1 ].body;
		expect( body.get( 'status' ) ).toBe( 'completed' );
		expect( body.get( 'stepId' ) ).toBe( 'posts' );
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
		driverConfig.onDestroyed( null, driverConfig.steps[ 1 ], { reason: 'done' } );
		await Promise.resolve();

		// Assert.
		expect( request ).toHaveBeenCalledTimes( 1 );

		// Act.
		resolveFirstRequest( {} );
		await guidedTours.progressRequest;

		// Assert.
		expect( request ).toHaveBeenCalledTimes( 2 );
		expect( request.mock.calls[ 1 ][ 1 ].body.get( 'status' ) ).toBe( 'completed' );
	} );
} );
