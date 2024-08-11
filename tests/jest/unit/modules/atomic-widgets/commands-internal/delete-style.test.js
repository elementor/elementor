import createContainer from '../createContainer';

describe( 'DeleteStyle - apply', () => {
	let DeleteStyleCommand;

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
		DeleteStyleCommand = ( await import( 'elementor/modules/atomic-widgets/assets/js/editor/commands-internal/delete-style' ) ).default;
	} );

	afterEach( () => {
		delete global.$e;
		delete global.elementor;

		jest.resetAllMocks();
	} );

	it( 'should delete style definition and update the reference in the settings', () => {
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
		command.apply( { container, styleDefID: 'style-id', bind } );

		// Assert
		expect( container.model.get( 'styles' ) ).toEqual( {} );

		expect( $e.internal ).toHaveBeenCalledWith(
			'document/elements/set-settings',
			{
				container,
				settings: {
					[ bind ]: {
						$$type: 'classes',
						value: [],
					},
				},
			},
		);
	} );

	it( 'should delete style definition and update the reference in the settings without deleting old ones', () => {
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
		command.apply( { container, styleDefID: 'style-id-1', bind } );

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
				settings: {
					[ bind ]: {
						$$type: 'classes',
						value: [ 'style-id-2' ],
					},
				},
			},
		);
	} );
} );
