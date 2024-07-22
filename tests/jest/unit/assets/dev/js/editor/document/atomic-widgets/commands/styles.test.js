import createContainer from '../createContainer';
import createModel from 'elementor/tests/jest/unit/assets/dev/js/editor/document/atomic-widgets/createModel';

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
								return true;
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

	it( 'should create new style object and update the reference in the settings & history', () => {
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

		const historyChanges = {
			[ container.id ]: {
				oldStyles: {},
				newStyles: updatedStyles,
				oldSettings: {
					[ bind ]: {},
				},
				newSettings: {
					[ bind ]: {
						$$type: 'classes',
						value: [ 'new-style-id' ],
					},
				},
			},
		};

		// Assert
		// expect( $e.internal ).toHaveBeenCalledWith(
		// 	'document/atomic-widgets/set-styles',
		// 	{
		// 		container,
		// 		styles: updatedStyles,
		// 	},
		// );
		//
		// expect( $e.internal ).toHaveBeenCalledWith(
		// 	'document/elements/set-settings',
		// 	{
		// 		container,
		// 		options: { render: false },
		// 		settings: {
		// 			classes: {
		// 				$$type: 'classes',
		// 				value: [ 'new-style-id' ],
		// 			},
		// 		},
		// 	},
		// );

		expect( $e.internal ).toHaveBeenCalledWith(
			'document/history/add-transaction',
			{
				containers: [ container ],
				data: { changes: historyChanges },
				type: 'change',
				restore: StylesCommand.restore,
			},
		);
	} );

	it( 'should create new style object and update the reference in the settings without deleting old reference', () => {
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
					variants: [
						{
							meta: { breakpoint: null, state: null },
							props: { color: 'red' },
						},
					],
				},
			},
			model: {
				set: jest.fn(),
			},
		} );

		// Act
		command.apply( { container, bind, props: { width: '10px' }, meta: { breakpoint: null, state: null } } );

		const updatedStyles = {
			'old-style-id': {
				id: 'old-style-id',
				label: '',
				type: 'class',
				variants: [
					{
						meta: { breakpoint: null, state: null },
						props: { color: 'red' },
					},
				],
			},
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
			},
		);

		expect( $e.internal ).toHaveBeenCalledWith(
			'document/elements/set-settings',
			{
				container,
				options: { render: false },
				settings: {
					[ bind ]: {
						$$type: 'classes',
						value: [ 'old-style-id', 'new-style-id' ],
					},
				},
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
			},
		);
	} );
} );

describe( 'styles - restore', () => {
	let StylesCommand;

	beforeEach( async () => {
		global.$e = {
			internal: jest.fn(),
			run: jest.fn(),
			modules: {
				editor: {
					document: {
						CommandHistoryDebounceBase: class {},
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

	it( 'should reset the styles and the settings', () => {
		const bind = 'classes';
		const container = createContainer( {
			widgetType: 'a-heading',
			elType: 'widget',
			id: '123',
			settings: {
				text: 'Test text',
				[ bind ]: {
					$$type: 'classes',
					value: [ 'new-style-id' ],
				},
			},
			styles: {
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
			},
		} );

		const historyItem = createModel( {
			containers: [ container ],
			data: {
				changes: {
					[ container.id ]: {
						oldStyles: {},
						newStyles: {
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
						},
						oldSettings: {
							[ bind ]: {},
						},
						newSettings: {
							[ bind ]: {
								$$type: 'classes',
								value: [ 'new-style-id' ],
							},
						},
					},
				},
			},
		} );

		// Act
		StylesCommand.restore( historyItem, false );

		// Assert
		expect( $e.internal ).toHaveBeenCalledWith(
			'document/atomic-widgets/set-styles',
			{
				container,
				styles: {},
			},
		);
		expect( $e.internal ).toHaveBeenCalledWith(
			'document/elements/set-settings',
			{
				container,
				options: { render: false },
				settings: {
					[ bind ]: {},
				},
			},
		);
	} );
} );
