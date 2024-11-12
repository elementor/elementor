import createContainer from '../createContainer';

describe( 'DeleteVariant - apply', () => {
	let DeleteVariantCommand;

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
		DeleteVariantCommand = ( await import( 'elementor/modules/atomic-widgets/assets/js/editor/commands-internal/delete-variant' ) ).default;
	} );

	afterEach( () => {
		delete global.$e;
		delete global.elementor;

		jest.resetAllMocks();
	} );

	it( 'should throw an error if style def does not exist', () => {
		const command = new DeleteVariantCommand();

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
			command.apply( { container, styleDefID: 'not-exits-style-id', meta: { breakpoint: null, state: null } } );
		} ).toThrowError( 'Style Def not found' );
	} );

	it( 'should delete style variant', () => {
		const command = new DeleteVariantCommand();

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
		command.apply( { container, styleDefID: 'style-id', meta: { breakpoint: null, state: null } } );

		const updatedStyles = {
			'style-id': {
				id: 'style-id',
				label: '',
				type: 'class',
				variants: [],
			},
		};

		// Assert
		expect( container.model.get( 'styles' ) ).toEqual( updatedStyles );
	} );

	it( 'should delete style variant without deleting other variants', () => {
		const command = new DeleteVariantCommand();

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
						{
							meta: { breakpoint: 'sm', state: null },
							props: {},
						},
					],
				},
			},
		} );

		// Act
		command.apply( { container, styleDefID: 'style-id', meta: { breakpoint: 'sm', state: null } } );

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

		// Assert
		expect( container.model.get( 'styles' ) ).toEqual( updatedStyles );
	} );

	it( 'should not delete style variant if variant does not exist (state or breakpoint)', () => {
		const command = new DeleteVariantCommand();

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

		// Act
		command.apply( { container, styleDefID: 'style-id', meta: { breakpoint: null, state: 'active' } } );
		command.apply( { container, styleDefID: 'style-id', meta: { breakpoint: 'sm', state: null } } );

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

		// Assert
		expect( container.model.get( 'styles' ) ).toEqual( updatedStyles );
	} );
} );
