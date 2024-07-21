import createContainer from '../createContainer';

describe( 'SetStyles - apply', () => {
	let SetStylesCommand;

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
		SetStylesCommand = ( await import( 'elementor-document/atomic-widgets/commands-internal/set-styles' ) ).default;
	} );

	afterEach( () => {
		delete global.$e;
		delete global.elementor;

		jest.resetAllMocks();
	} );

	it( 'should update styles and ref', () => {
		const command = new SetStylesCommand();

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
		} );

		const styles = {
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

		// Act
		command.apply( { container, bind, styles } );

		// Assert
		expect( container.model.get( 'styles' ) ).toEqual( styles );
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

	it( 'should update styles and add ref', () => {
		const command = new SetStylesCommand();

		const bind = 'classes';
		const container = createContainer( {
			widgetType: 'a-heading',
			elType: 'widget',
			id: '123',
			settings: {
				text: 'Test text',
				[ bind ]: [ 'old-style-id' ],
			},
			styles: {
				'old-style-id': {
					id: 'old-style-id',
					label: '',
					type: 'class',
					variants: [
						{
							meta: { breakpoint: null, state: null },
							props: { width: '10px' },
						},
					],
				},
			},
		} );

		const styles = {
			'style-def-1': {
				id: 'style-def-1',
				label: '',
				type: 'class',
				variants: [
					{
						meta: { breakpoint: null, state: null },
						props: { width: '10px' },
					},
				],
			},
			'style-def-2': {
				id: 'style-def-2',
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

		// Act
		command.apply( { container, bind, styles } );

		// Assert
		expect( container.model.get( 'styles' ) ).toEqual( styles );
		expect( $e.internal ).toHaveBeenCalledWith(
			'document/elements/set-settings',
			{
				container,
				options: { render: false },
				settings: {
					classes: {
						$$type: 'classes',
						value: [ 'style-def-1', 'style-def-2' ],
					},
				},
			},
		);
	} );
} );

describe( 'SetStyles - validateStyles', () => {
	let SetStylesCommand;

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
		SetStylesCommand = ( await import( 'elementor-document/atomic-widgets/commands-internal/set-styles' ) ).default;
	} );

	afterEach( () => {
		delete global.$e;
		delete global.elementor;

		jest.resetAllMocks();
	} );

	it.each( [
		[
			'a valid map',
			{
				style1: {
					id: 'style1',
					variants: [ { meta: {}, props: {} } ],
					type: 'styleType1',
				},
				style2: {
					id: 'style2',
					variants: [ { meta: {}, props: {} } ],
					type: 'styleType2',
				},
			},
			true,
		],
		[
			'a map with invalid id',
			{
				style1: {
					id: 123, // Invalid id
					variants: [ { meta: {}, props: {} } ],
					type: 'styleType1',
				},
			},
			false,
		],
		[
			'a map with invalid variants',
			{
				style1: {
					id: 'style1',
					variants: 'not an array', // Invalid variants
					type: 'styleType1',
				},
			},
			false,
		],
		[
			'a map with invalid label',
			{
				style1: {
					id: 'style1',
					variants: [ { meta: {}, props: {} } ],
					label: 123, // Invalid label
					type: 'styleType1',
				},
			},
			false,
		],
		[
			'a map with invalid type',
			{
				style1: {
					id: 'style1',
					variants: [ { meta: {}, props: {} } ],
					type: 123, // Invalid type
				},
			},
			false,
		],
		[
			'a map with optional label',
			{
				style1: {
					id: 'style1',
					variants: [ { meta: {}, props: {} } ],
					type: 'styleType1',
					label: 'A label',
				},
			},
			true,
		],
	] )( 'should return %s', ( description, styles, shouldNotThrow ) => {
		const command = new SetStylesCommand();

		if ( shouldNotThrow ) {
			expect( () => command.validateStyles( styles ) ).not.toThrow();
		} else {
			expect( () => command.validateStyles( styles ) ).toThrow();
		}
	} );
} );
