import createContainer from '../createContainer';
import createModel from 'elementor/tests/jest/unit/assets/dev/js/editor/document/atomic-widgets/createModel';

describe( 'CreateStyle - apply', () => {
	let CreateStyleCommand;

	beforeEach( async () => {
		global.$e = {
			internal: jest.fn(),
			run: jest.fn(),
			modules: {
				editor: {
					document: {
						CommandHistoryDebounceBase: class {
							isHistoryActive() {
								return true;
							}
						},
					},
				},
			},
		};

		// Need to import dynamically since the command extends a global variable which isn't available in regular import.
		CreateStyleCommand = ( await import( 'elementor-document/atomic-widgets/commands/create-style' ) ).default;
	} );

	afterEach( () => {
		delete global.$e;
		delete global.elementor;

		jest.resetAllMocks();
	} );

	it( 'should create new style object and update the reference in the settings & add history transaction', () => {
		const command = new CreateStyleCommand();

		// Mock generateId
		command.randomId = () => 'new-style-id';

		const bind = 'classes';
		const container = createContainer( {
			widgetType: 'a-heading',
			elType: 'widget',
			id: '123',
			settings: {},
			styles: {},
		} );

		// Act
		command.apply( { container, bind } );

		const updatedStyles = {
			'new-style-id': {
				id: 'new-style-id',
				label: '',
				type: 'class',
				variants: [],
			},
		};

		const historyChanges = {
			[ container.id ]: {
				oldStyles: {},
				newStyles: updatedStyles,
				oldSettings: {
					[ bind ]: {
						$$type: 'classes',
						value: [],
					},
				},
				newSettings: {
					[ bind ]: {
						$$type: 'classes',
						value: [ 'new-style-id' ],
					},
				},
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

		expect( $e.internal ).toHaveBeenCalledWith(
			'document/history/add-transaction',
			{
				containers: [ container ],
				data: { changes: historyChanges },
				type: 'change',
				restore: CreateStyleCommand.restore,
			},
		);
	} );

	it( 'should create new style object and update the reference in the settings without deleting old references', () => {
		const command = new CreateStyleCommand();

		// Mock generateId
		command.randomId = () => 'new-style-id';

		const bind = 'classes';
		const container = createContainer( {
			widgetType: 'a-heading',
			elType: 'widget',
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
					label: '',
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
				label: '',
				type: 'class',
				variants: [],
			},
			'new-style-id': {
				id: 'new-style-id',
				label: '',
				type: 'class',
				variants: [],
			},
		};

		const historyChanges = {
			[ container.id ]: {
				oldStyles: {
					'old-style-id': {
						id: 'old-style-id',
						label: '',
						type: 'class',
						variants: [],
					},
				},
				newStyles: updatedStyles,
				oldSettings: {
					[ bind ]: {
						$$type: 'classes',
						value: [ 'old-style-id' ],
					},
				},
				newSettings: {
					[ bind ]: {
						$$type: 'classes',
						value: [ 'old-style-id', 'new-style-id' ],
					},
				},
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

		expect( $e.internal ).toHaveBeenCalledWith(
			'document/history/add-transaction',
			{
				containers: [ container ],
				data: { changes: historyChanges },
				type: 'change',
				restore: CreateStyleCommand.restore,
			},
		);
	} );
} );

describe( 'CreateStyle - Restore', () => {
	let CreateStyleCommand;

	beforeEach( async () => {
		global.$e = {
			internal: jest.fn(),
			run: jest.fn(),
			modules: {
				editor: {
					document: {
						CommandHistoryDebounceBase: class {},
					},
				},
			},
		};

		// Need to import dynamically since the command extends a global variable which isn't available in regular import.
		CreateStyleCommand = ( await import( 'elementor-document/atomic-widgets/commands/create-style' ) ).default;
	} );

	afterEach( () => {
		delete global.$e;
		delete global.elementor;

		jest.resetAllMocks();
	} );

	it( 'should restore the styles and the references in the settings', () => {
		const bind = 'classes';
		const container = createContainer( {
			widgetType: 'a-heading',
			elType: 'widget',
			id: '123',
			settings: {
				text: 'Test text',
				[ bind ]: {
					$$type: 'classes',
					value: [ 'new-style-id' ],
				},
			},
			styles: {
				'new-style-id': {
					id: 'new-style-id',
					label: '',
					type: 'class',
					variants: [],
				},
			},
		} );

		const historyItem = createModel( {
			containers: [ container ],
			data: {
				changes: {
					[ container.id ]: {
						oldStyles: {},
						newStyles: {
							'new-style-id': {
								id: 'new-style-id',
								label: '',
								type: 'class',
								variants: [],
							},
						},
						oldSettings: {
							[ bind ]: {},
						},
						newSettings: {
							[ bind ]: {
								$$type: 'classes',
								value: [ 'new-style-id' ],
							},
						},
					},
				},
			},
		} );

		// Act
		CreateStyleCommand.restore( historyItem, false );

		// Assert
		expect( container.model.get( 'styles' ) ).toEqual( {} );

		expect( $e.internal ).toHaveBeenCalledWith(
			'document/elements/set-settings',
			{
				container,
				options: { render: false },
				settings: {
					[ bind ]: {},
				},
			},
		);
	} );

	it( 'should undo the styles and the settings', () => {
		const bind = 'classes';
		const container = createContainer( {
			widgetType: 'a-heading',
			elType: 'widget',
			id: '123',
			settings: {
				text: 'Test text',
			},
			styles: {},
		} );

		const historyItem = createModel( {
			containers: [ container ],
			data: {
				changes: {
					[ container.id ]: {
						oldStyles: {},
						newStyles: {
							'new-style-id': {
								id: 'new-style-id',
								label: '',
								type: 'class',
								variants: [],
							},
						},
						oldSettings: {
							[ bind ]: {},
						},
						newSettings: {
							[ bind ]: {
								$$type: 'classes',
								value: [ 'new-style-id' ],
							},
						},
					},
				},
			},
		} );

		// Act
		CreateStyleCommand.restore( historyItem, true );

		// Assert
		expect( container.model.get( 'styles' ) ).toEqual( {
			'new-style-id': {
				id: 'new-style-id',
				label: '',
				type: 'class',
				variants: [],
			},
		} );

		expect( $e.internal ).toHaveBeenCalledWith(
			'document/elements/set-settings',
			{
				container,
				options: { render: false },
				settings: {
					[ bind ]: {
						$$type: 'classes',
						value: [ 'new-style-id' ],
					},
				},
			},
		);
	} );
} );
