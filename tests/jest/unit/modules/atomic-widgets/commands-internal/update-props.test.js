import createContainer from '../createContainer';

describe( 'UpdateProps - apply', () => {
	let UpdatePropsCommand;

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
		UpdatePropsCommand = ( await import( 'elementor/modules/atomic-widgets/assets/js/editor/commands-internal/update-props' ) ).UpdateProps;
	} );

	afterEach( () => {
		delete global.$e;
		delete global.elementor;

		jest.resetAllMocks();
	} );

	it( 'should throw an error when styleDef does not exist', () => {
		const command = new UpdatePropsCommand();

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
			command.apply( { container, styleDefID: 'not-exited-style-id', meta: { breakpoint: null, state: null }, props: { width: '10px' } } );
		} ).toThrowError( 'Style Def not found' );
	} );

	it( 'should throw an error when style variant does not exist', () => {
		const command = new UpdatePropsCommand();

		const bind = 'classes';
		const container = createContainer( {
			widgetType: 'a-heading',
			elType: 'widget',
			id: '123',
			settings: {
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
			command.apply( { container, styleDefID: 'style-id', meta: { breakpoint: null, state: null }, props: { width: '10px' } } );
		} ).toThrowError( 'Style Variant not found' );
	} );

	it( 'should update exited variant with new props, mutate old ones and delete null or undefined props', () => {
		const command = new UpdatePropsCommand();

		const bind = 'classes';
		const container = createContainer( {
			widgetType: 'a-heading',
			elType: 'widget',
			id: '123',
			settings: {
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
							props: { nullToDelete: 'something', undefinedToDelete: 'something', color: 'black' },
						},
						{
							meta: { breakpoint: null, state: 'active' },
							props: { color: 'red' },
						},
					],
				},
			},
		} );
		const originalStyles = { ...container.model.get( 'styles' ) };

		// Act
		command.apply( {
			container,
			styleDefID: 'style-id',
			meta: { breakpoint: null, state: null },
			props: {
				nullToDelete: null,
				undefinedToDelete: undefined,
				color: 'blue',
				width: '10px',
			},
		} );

		const updatedStyles = {
			'style-id': {
				id: 'style-id',
				label: '',
				type: 'class',
				variants: [
					{
						meta: { breakpoint: null, state: null },
						props: { color: 'blue', width: '10px' },
					},
					{
						meta: { breakpoint: null, state: 'active' },
						props: { color: 'red' },
					},
				],
			},
		};

		// Assert
		expect( container.model.get( 'styles' ) ).toEqual( updatedStyles );
		expect( container.model.get( 'styles' )[ 'style-id' ] ).toBe( originalStyles[ 'style-id' ] );
	} );
} );
