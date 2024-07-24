import createContainer from '../createContainer';

describe( 'UpdateStyle - apply', () => {
	let UpdateStyleCommand;

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
		UpdateStyleCommand = ( await import( 'elementor-document/atomic-widgets/commands/update-style' ) ).default;
	} );

	afterEach( () => {
		delete global.$e;
		delete global.elementor;

		jest.resetAllMocks();
	} );

	it( 'should throw error when styleDef not exits', () => {
		const command = new UpdateStyleCommand();

		const bind = 'classes';
		const container = createContainer( {
			widgetType: 'a-heading',
			elType: 'widget',
			id: '123',
			settings: {
				[ bind ]: {
					$$type: 'classes',
					value: [ 'exited-style-id' ],
				},
			},
			styles: {
				'exited-style-id': {
					id: 'exited-style-id',
					label: '',
					type: 'class',
					variants: [],
				},
			},
		} );

		// Act & Assert
		expect( () => {
			command.apply( { container, styleDefId: 'not-exited-style-id', props: { width: '10px' }, meta: { breakpoint: null, state: null } } );
		} ).toThrowError( 'Style Def not found' );
	} );

	it( 'should add new variant and update the props', () => {
		const command = new UpdateStyleCommand();

		const bind = 'classes';
		const container = createContainer( {
			widgetType: 'a-heading',
			elType: 'widget',
			id: '123',
			settings: {
				[ bind ]: {
					$$type: 'classes',
					value: [ 'exited-style-id' ],
				},
			},
			styles: {
				'exited-style-id': {
					id: 'exited-style-id',
					label: '',
					type: 'class',
					variants: [],
				},
			},
		} );

		// Act
		command.apply( { container, styleDefId: 'exited-style-id', props: { width: '10px' }, meta: { breakpoint: null, state: null } } );

		const updatedStyles = {
			'exited-style-id': {
				id: 'exited-style-id',
				label: '',
				type: 'class',
				variants: [
					{
						meta: { breakpoint: null, state: null },
						props: { width: '10px' },
					},
				],
			},
		};

		const historyChanges = {
			[ container.id ]: {
				oldStyles: {
					'exited-style-id': {
						id: 'exited-style-id',
						label: '',
						type: 'class',
						variants: [],
					},
				},
				newStyles: updatedStyles,
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
				restore: UpdateStyleCommand.restore,
			},
		);
	} );

	it( 'should update exited variant, add new props and update old ones', () => {
		const command = new UpdateStyleCommand();

		const bind = 'classes';
		const container = createContainer( {
			widgetType: 'a-heading',
			elType: 'widget',
			id: '123',
			settings: {
				[ bind ]: {
					$$type: 'classes',
					value: [ 'exited-style-id', 'another-style-id' ],
				},
			},
			styles: {
				'another-style-id': {
					id: 'another-style-id',
					label: '',
					type: 'class',
					variants: [
						{
							meta: { breakpoint: null, state: null },
							props: { color: 'black' },
						},
					],
				},
				'exited-style-id': {
					id: 'exited-style-id',
					label: '',
					type: 'class',
					variants: [
						{
							meta: { breakpoint: 'sm', state: null },
							props: { color: 'blue' },
						},
						{
							meta: { breakpoint: null, state: null },
							props: { color: 'red' },
						},
					],
				},
			},
		} );

		// Act
		command.apply( { container, styleDefId: 'exited-style-id', props: { color: 'blue', width: '10px' }, meta: { breakpoint: null, state: null } } );

		const updatedStyles = {
			'another-style-id': {
				id: 'another-style-id',
				label: '',
				type: 'class',
				variants: [
					{
						meta: { breakpoint: null, state: null },
						props: { color: 'black' },
					},
				],
			},
			'exited-style-id': {
				id: 'exited-style-id',
				label: '',
				type: 'class',
				variants: [
					{
						meta: { breakpoint: 'sm', state: null },
						props: { color: 'blue' },
					},
					{
						meta: { breakpoint: null, state: null },
						props: { color: 'blue', width: '10px' },
					},
				],
			},
		};

		// Assert
		expect( container.model.get( 'styles' ) ).toEqual( updatedStyles );
	} );
} );
