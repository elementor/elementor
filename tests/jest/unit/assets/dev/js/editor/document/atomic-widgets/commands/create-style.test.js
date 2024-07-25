import createContainer from '../createContainer';

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
				styleDefId: 'new-style-id',
				bind,
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
				type: 'add',
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
				styleDefId: 'new-style-id',
				bind,
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
				type: 'add',
				restore: CreateStyleCommand.restore,
			},
		);
	} );
} );
