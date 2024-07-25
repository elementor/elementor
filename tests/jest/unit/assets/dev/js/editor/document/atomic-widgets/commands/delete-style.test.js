import createContainer from '../createContainer';

describe( 'DeleteStyle - apply', () => {
	let DeleteStyleCommand;

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
		DeleteStyleCommand = ( await import( 'elementor-document/atomic-widgets/commands/delete-style' ) ).default;
	} );

	afterEach( () => {
		delete global.$e;
		delete global.elementor;

		jest.resetAllMocks();
	} );

	it( 'should delete style object and update the reference in the settings & add history transaction', () => {
		const command = new DeleteStyleCommand();

		const bind = 'classes';
		const container = createContainer( {
			widgetType: 'a-heading',
			elType: 'widget',
			id: '123',
			settings: {
				text: 'Test text',
				[ bind ]: {
					$$type: 'classes',
					value: [ 'style-id' ],
				},
			},
			styles: {
				'style-id': {
					id: 'style-id',
					label: '',
					type: 'class',
					variants: [],
				},
			},
		} );

		// Act
		command.apply( { container, styleDefId: 'style-id', bind } );

		const historyChanges = {
			[ container.id ]: {
				styleDefId: 'style-id',
				bind,
			},
		};

		// Assert
		expect( container.model.get( 'styles' ) ).toEqual( {} );

		expect( $e.internal ).toHaveBeenCalledWith(
			'document/elements/set-settings',
			{
				container,
				options: { render: false },
				settings: {
					[ bind ]: {
						$$type: 'classes',
						value: [],
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
				restore: DeleteStyleCommand.restore,
			},
		);
	} );

	it( 'should delete style object and update the reference in the settings without deleting old ones & add history transaction', () => {
		const command = new DeleteStyleCommand();

		const bind = 'classes';
		const container = createContainer( {
			widgetType: 'a-heading',
			elType: 'widget',
			id: '123',
			settings: {
				text: 'Test text',
				[ bind ]: {
					$$type: 'classes',
					value: [ 'style-id-1', 'style-id-2' ],
				},
			},
			styles: {
				'style-id-1': {
					id: 'style-id-1',
					label: '',
					type: 'class',
					variants: [],
				},
				'style-id-2': {
					id: 'style-id-2',
					label: '',
					type: 'class',
					variants: [],
				},
			},
		} );

		// Act
		command.apply( { container, styleDefId: 'style-id-1', bind } );

		const historyChanges = {
			[ container.id ]: {
				styleDefId: 'style-id-1',
				bind,
			},
		};

		// Assert
		expect( container.model.get( 'styles' ) ).toEqual( {
			'style-id-2': {
				id: 'style-id-2',
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
						value: [ 'style-id-2' ],
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
				restore: DeleteStyleCommand.restore,
			},
		);
	} );
} );
