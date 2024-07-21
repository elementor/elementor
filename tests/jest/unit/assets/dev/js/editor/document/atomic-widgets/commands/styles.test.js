describe( 'styles', () => {
	let StylesCommand;

	beforeEach( async () => {
		global.$e = {
			internal: jest.fn(),
			run: jest.fn(),
			modules: {
				editor: {
					document: {
						CommandHistoryDebounceBase: class {
							isHistoryActive() {
								return false;
							}
						},
					},
				},
			},
		};

		// Need to import dynamically since the command extends a global variable which isn't available in regular import.
		StylesCommand = ( await import( 'elementor-document/atomic-widgets/commands/styles' ) ).default;
	} );

	afterEach( () => {
		delete global.$e;
		delete global.elementor;

		jest.resetAllMocks();
	} );

	it( 'should create new style object and update the reference in the settings', () => {
		const command = new StylesCommand();

		// Mock generateId
		command.randomId = jest.fn( () => 'new-style-id' );

		const bind = 'classes';
		const container = createContainer( {
			widgetType: 'a-heading',
			elType: 'widget',
			id: '123',
			settings: {
				text: 'Test text',
			},
			styles: {},
			model: {
				set: jest.fn(),
			},
		} );

		// Act
		command.apply( { container, bind, props: { width: '10px' }, meta: { breakpoint: null, state: null } } );

		const updatedStyles = {
			'new-style-id': {
				id: 'new-style-id',
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

		// Assert
		expect( $e.internal ).toHaveBeenCalledWith(
			'document/atomic-widgets/set-styles',
			{
				container,
				styles: updatedStyles,
				bind,
			},
		);
	} );

	it( 'should add props to exits style object and create a new style variant', () => {
		const command = new StylesCommand();

		const bind = 'classes';
		const container = createContainer( {
			widgetType: 'a-heading',
			elType: 'widget',
			id: '123',
			settings: {
				text: 'Test text',
			},
			styles: {
				'existed-style-ids': {
					id: 'existed-style-ids',
					label: '',
					type: 'class',
					variants: [
						{
							meta: { breakpoint: null, state: null },
							props: { width: '20px' },
						},
					],
				},
			},
		} );

		// Act
		command.apply( {
			container,
			bind,
			props: { color: 'red' },
			meta: { breakpoint: null, state: 'active' },
			styleDefId: 'existed-style-ids',
		} );

		const updatedStyles = {
			'existed-style-ids': {
				id: 'existed-style-ids',
				label: '',
				type: 'class',
				variants: [
					{
						meta: { breakpoint: null, state: null },
						props: { width: '20px' },
					},
					{
						meta: { breakpoint: null, state: 'active' },
						props: { color: 'red' },
					},
				],
			},
		};

		// Assert
		expect( $e.internal ).toHaveBeenCalledWith(
			'document/atomic-widgets/set-styles',
			{
				container,
				styles: updatedStyles,
				bind,
			},
		);
	} );

	it( 'should add props to exits style object and edit existed style variant', () => {
		const command = new StylesCommand();

		const bind = 'classes';
		const container = createContainer( {
			widgetType: 'a-heading',
			elType: 'widget',
			id: '123',
			settings: {
				text: 'Test text',
			},
			styles: {
				'existed-style-id': {
					id: 'existed-style-id',
					label: '',
					type: 'class',
					variants: [
						{
							meta: { breakpoint: null, state: null },
							props: { width: '20px' },
						},
					],
				},
			},
		} );

		// Act
		command.apply( {
			container,
			bind,
			props: { color: 'red' },
			meta: { breakpoint: null, state: null },
			styleDefId: 'existed-style-id',
		} );

		const updatedStyles = {
			'existed-style-id': {
				id: 'existed-style-id',
				label: '',
				type: 'class',
				variants: [
					{
						meta: { breakpoint: null, state: null },
						props: { width: '20px', color: 'red' },
					},
				],
			},
		};

		// Assert
		expect( $e.internal ).toHaveBeenCalledWith(
			'document/atomic-widgets/set-styles',
			{
				container,
				styles: updatedStyles,
				bind,
			},
		);
	} );
} );

function createContainer( {
	elType,
	widgetType,
	id,
	settings = {},
	styles = {},
} = {} ) {
	const createModel = ( attributes ) => ( {
		attributes,
		get( key ) {
			return this.attributes[ key ];
		},
		set( key, value ) {
			this.attributes[ key ] = value;
		},
	} );

	const settingsModel = createModel( settings );

	return {
		id,
		settings: settingsModel,
		model: createModel( {
			elType,
			widgetType,
			styles,
			settings: settingsModel,
		} ),
	};
}

