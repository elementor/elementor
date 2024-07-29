import createContainer from '../createContainer';

describe( 'CreateVariant - apply', () => {
	let CreateVariantCommand;

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
		CreateVariantCommand = ( await import( 'elementor/modules/atomic-widgets/assets/js/editor/commands-internal/create-variant' ) ).default;
	} );

	afterEach( () => {
		delete global.$e;
		delete global.elementor;

		jest.resetAllMocks();
	} );

	it( 'should throw an error if style def does not exist', () => {
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

		// Act & Assert
		expect( () => {
			command.apply( { container, styleDefId: 'not-exits-style-id', meta: { breakpoint: null, state: null } } );
		} ).toThrowError( 'Style Def not found' );
	} );

	it( 'should throw an error if style variant already exits', () => {
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
					variants: [
						{
							meta: { breakpoint: null, state: null },
							props: {},
						},
					],
				},
			},
		} );

		// Act & Assert
		expect( () => {
			command.apply( { container, styleDefId: 'style-id', meta: { breakpoint: null, state: null } } );
		} ).toThrowError( 'Style Variant already exits' );
	} );

	it( 'should create a new style variant', () => {
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
					variants: [
						{
							meta: { breakpoint: null, state: 'active' },
							props: {},
						},
					],
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
						meta: { breakpoint: null, state: 'active' },
						props: {},
					},
					{
						meta: { breakpoint: null, state: null },
						props: {},
					},
				],
			},
		};

		// Assert
		expect( container.model.get( 'styles' ) ).toEqual( updatedStyles );
	} );
} );
