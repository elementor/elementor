import createContainer from 'elementor/tests/jest/utils/create-container';

describe( `$e.run( 'kit-elements-defaults/confirm-creation' )`, () => {
	let ConfirmCreationCommand;

	beforeEach( async () => {
		global.$e = {
			run: jest.fn(),
			modules: {
				editor: {
					CommandContainerBase: class {},
				},
			},
		};

		global.elementorModules = {
			editor: {
				utils: {
					Introduction: class {
						introductionViewed = false;
						checkboxElement = { prop: jest.fn( () => false ) };
						dialog = {
							addElement: jest.fn(),
							getElements: jest.fn( () => this.checkboxElement ),
						};
						getDialog = jest.fn( () => this.dialog );
						show = jest.fn();
						setViewed = jest.fn();
					},
				},
			},
		};

		global.elementor = {
			config: {
				user: {
					introduction: {},
				},
			},
		};

		// Need to import dynamically since the command extends a global variable which isn't available in regular import.
		ConfirmCreationCommand = ( await import( 'elementor/modules/kit-elements-defaults/assets/js/editor/commands/confirm-creation' ) ).default;
	} );

	afterEach( () => {
		delete global.$e;
		delete global.elementorModules;
		delete global.elementor;

		ConfirmCreationCommand.introduction = null;

		jest.resetAllMocks();
	} );

	it( 'should call `create` command without open confirm dialog when config filled', () => {
		// Arrange
		elementor.config.user.introduction = { kit_elements_defaults_create_dialog: true };

		const container = createContainer();
		const command = new ConfirmCreationCommand();

		// Act
		command.apply( { container } );

		// Assert
		expect( global.$e.run ).toHaveBeenCalledWith( 'kit-elements-defaults/create', { container } );
		expect( ConfirmCreationCommand.introduction.show ).not.toHaveBeenCalled();
	} );

	it( 'should show dialog before `create` and when confirm it calls `create`', () => {
		// Arrange
		const container = createContainer();
		const command = new ConfirmCreationCommand();

		// Act
		command.apply( { container } );
		ConfirmCreationCommand.introduction.dialog.onConfirm();

		// Assert
		expect( ConfirmCreationCommand.introduction.show ).toHaveBeenCalledTimes( 1 );
		expect( global.$e.run ).toHaveBeenCalledTimes( 1 );
		expect( global.$e.run ).toHaveBeenCalledWith( 'kit-elements-defaults/create', { container } );
		expect( ConfirmCreationCommand.introduction.setViewed ).not.toHaveBeenCalled();
	} );

	it( 'should show the dialog on the fisrt time and after checking the checkbox it should not be shown', () => {
		// Arrange
		const container = createContainer();
		const command = new ConfirmCreationCommand();

		// Act
		command.apply( { container } );
		ConfirmCreationCommand.introduction.dialog.getElements().prop.mockReturnValueOnce( true );
		ConfirmCreationCommand.introduction.dialog.onConfirm();

		// Assert
		expect( ConfirmCreationCommand.introduction.show ).toHaveBeenCalledTimes( 1 );
		expect( global.$e.run ).toHaveBeenCalledTimes( 1 );
		expect( global.$e.run ).toHaveBeenCalledWith( 'kit-elements-defaults/create', { container } );
		expect( ConfirmCreationCommand.introduction.setViewed ).toHaveBeenCalled();
	} );

	it( 'should replace the container when calling `onConfirm`', () => {
		// Arrange
		const command = new ConfirmCreationCommand();

		const container1 = createContainer( { id: 1 } );
		const container2 = createContainer( { id: 2 } );

		// Act
		command.apply( { container: container1 } );
		ConfirmCreationCommand.introduction.dialog.onConfirm();

		command.apply( { container: container2 } );
		ConfirmCreationCommand.introduction.dialog.onConfirm();

		// Assert
		expect( ConfirmCreationCommand.introduction.show ).toHaveBeenCalledTimes( 2 );
		expect( global.$e.run ).toHaveBeenNthCalledWith( 1, 'kit-elements-defaults/create', { container: container1 } );
		expect( global.$e.run ).toHaveBeenNthCalledWith( 2, 'kit-elements-defaults/create', { container: container2 } );
	} );
} );
