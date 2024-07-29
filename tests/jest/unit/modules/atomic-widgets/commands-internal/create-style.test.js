import createContainer from '../createContainer';

describe( 'CreateStyle - apply', () => {
	let CreateStyleCommand;

	beforeEach( async () => {
		global.$e = {
			internal: jest.fn(),
			run: jest.fn(),
			modules: {
				editor: {
					CommandContainerInternalBase: class {},
				},
			},
		};

		// Need to import dynamically since the command extends a global variable which isn't available in regular import.
		CreateStyleCommand = ( await import( 'elementor/modules/atomic-widgets/assets/js/editor/commands-internal/create-style' ) ).default;
	} );

	afterEach( () => {
		delete global.$e;
		delete global.elementor;

		jest.resetAllMocks();
	} );

	it( 'should create a new style definition and update the reference in the settings', () => {
		const command = new CreateStyleCommand();

		// Mock generateId
		command.randomId = () => 'new-style-id';

		const bind = 'classes';
		const container = createContainer( {
			widgetType: 'a-heading',
			elType: 'widget',
			label: 'Heading',
			id: '123',
			settings: {},
			styles: {},
		} );

		// Act
		command.apply( { container, bind } );

		const updatedStyles = {
			'new-style-id': {
				id: 'new-style-id',
				label: 'Heading Style 1',
				type: 'class',
				variants: [],
			},
		};

		// Assert
		expect( container.model.get( 'styles' ) ).toEqual( updatedStyles );

		expect( $e.internal ).toHaveBeenCalledWith(
			'document/elements/set-settings',
			{
				container,
				options: { render: false },
				settings: {
					classes: {
						$$type: 'classes',
						value: [ 'new-style-id' ],
					},
				},
			},
		);
	} );

	it( 'should create a new style definition and update the reference in the settings without deleting old references', () => {
		const command = new CreateStyleCommand();

		// Mock generateId
		command.randomId = () => 'new-style-id';

		const bind = 'classes';
		const container = createContainer( {
			widgetType: 'a-heading',
			elType: 'widget',
			label: 'Heading',
			id: '123',
			settings: {
				text: 'Test text',
				[ bind ]: {
					$$type: 'classes',
					value: [ 'old-style-id' ],
				},
			},
			styles: {
				'old-style-id': {
					id: 'old-style-id',
					label: 'Heading Style 1',
					type: 'class',
					variants: [],
				},
			},
		} );

		// Act
		command.apply( { container, bind } );

		const updatedStyles = {
			'old-style-id': {
				id: 'old-style-id',
				label: 'Heading Style 1',
				type: 'class',
				variants: [],
			},
			'new-style-id': {
				id: 'new-style-id',
				label: 'Heading Style 2',
				type: 'class',
				variants: [],
			},
		};

		// Assert
		expect( container.model.get( 'styles' ) ).toEqual( updatedStyles );

		expect( $e.internal ).toHaveBeenCalledWith(
			'document/elements/set-settings',
			{
				container,
				options: { render: false },
				settings: {
					classes: {
						$$type: 'classes',
						value: [ 'old-style-id', 'new-style-id' ],
					},
				},
			},
		);
	} );
} );
