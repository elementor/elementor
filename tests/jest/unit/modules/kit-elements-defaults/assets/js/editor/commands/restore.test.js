import { updateElementDefaults } from 'elementor/modules/kit-elements-defaults/assets/js/editor/api';

jest.mock( 'elementor/modules/kit-elements-defaults/assets/js/editor/api', () => ( {
	__esModule: true,
	updateElementDefaults: jest.fn(),
} ) );

describe( `$e.run( 'kit-elements-defaults/restore' )`, () => {
	let RestoreCommand;

	beforeEach( async () => {
		global.$e = {
			internal: jest.fn(),
			modules: {
				CommandBase: class {},
			},
		};

		global.elementor = {
			notifications: {
				showToast: jest.fn(),
			},
		};

		// Need to import dynamically since the command extends a global variable which isn't available in regular import.
		RestoreCommand = ( await import( 'elementor/modules/kit-elements-defaults/assets/js/editor/commands/restore' ) ).default;
	} );

	afterEach( () => {
		delete global.$e;
		delete global.elementor;

		jest.resetAllMocks();
	} );

	it( 'should restore default values for button widget', () => {
		// Arrange.
		const command = new RestoreCommand();

		// Act.
		command.apply( {
			type: 'button',
			settings: {
				type: 'info',
				color: '#FFF',
			} } );

		// Assert.
		expect( updateElementDefaults ).toHaveBeenCalledWith( 'button', {
			type: 'info',
			color: '#FFF',
		} );
	} );

	it( 'should throw an error if upsert fails', () => {
		// Arrange.
		const command = new RestoreCommand(),
			type = 'button',
			settings = {
				type: 'info',
			};

		updateElementDefaults.mockImplementation( () => {
			throw new Error( 'Failed to upsert' );
		} );

		// Act & Assert.
		expect( () => command.apply( { type, settings } ) ).rejects.toThrow( 'Failed to upsert' );
	} );
} );
