import createContainer from '../createContainer';

describe( 'CreateVariant - apply', () => {
	let CreateVariantCommand;

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
		CreateVariantCommand = ( await import( 'elementor-document/atomic-widgets/commands/create-variant' ) ).default;
	} );

	afterEach( () => {
		delete global.$e;
		delete global.elementor;

		jest.resetAllMocks();
	} );

	it( 'should create new style variant & add history transaction', () => {
		const command = new CreateVariantCommand();

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
		command.apply( { container, styleDefId: 'style-id', meta: { breakpoint: null, state: null } } );

		const updatedStyles = {
			'style-id': {
				id: 'style-id',
				label: '',
				type: 'class',
				variants: [
					{
						meta: { breakpoint: null, state: null },
						props: {},
					},
				],
			},
		};

		const historyChanges = {
			[ container.id ]: {
				styleDefId: 'style-id',
				meta: { breakpoint: null, state: null },
			},
		};

		// Assert
		expect( container.model.get( 'styles' ) ).toEqual( updatedStyles );

		expect( $e.internal ).toHaveBeenCalledWith(
			'document/history/add-transaction',
			{
				containers: [ container ],
				data: { changes: historyChanges },
				type: 'change',
				restore: CreateVariantCommand.restore,
			},
		);
	} );
} );
