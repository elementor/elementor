import createContainer from '../createContainer';

describe( 'Styles - apply', () => {
	let createStyleCommand;

	beforeAll( async () => {
		global.$e = {
			modules: {
				editor: {
					CommandContainerInternalBase: class {
					},
					document: {
						CommandHistoryDebounceBase: class {
							isHistoryActive() {
								return false;
							}
						},
					},
				},
			},
			run: jest.fn(),
		};

		const CreateStyleCommand = ( await import( 'elementor/modules/atomic-widgets/assets/js/editor/commands-internal/create-style' ) ).default;
		const CreateVariantCommand = ( await import( 'elementor/modules/atomic-widgets/assets/js/editor/commands-internal/create-variant' ) ).default;
		const UpdatePropsCommand = ( await import( 'elementor/modules/atomic-widgets/assets/js/editor/commands-internal/update-props' ) ).default;
		const SetSettingsCommand = ( await import( 'elementor-document/elements/commands-internal/set-settings' ) ).default;

		// For mocking the randomId method
		createStyleCommand = new CreateStyleCommand();

		global.$e.internal = ( command, args ) => {
			switch ( command ) {
				case 'document/atomic-widgets/create-style':
					return createStyleCommand.apply( args );

				case 'document/atomic-widgets/create-variant':
					return new CreateVariantCommand().apply( args );

				case 'document/atomic-widgets/update-props':
					return new UpdatePropsCommand().apply( args );

				case 'document/elements/set-settings':
					return new SetSettingsCommand().apply( args );
			}
		};
	} );

	afterAll( async () => {
		delete global.$e;
		delete global.elementor;

		jest.resetAllMocks();
	} );

	it.each( [
		[
			'create a new style definition, a new variant, update props and update the reference in the settings',
			{ bind: 'classes', meta: { breakpoint: null, state: null }, props: { color: 'red' } },
			{
				label: 'Container',
				settings: {
					text: 'Test text',
				},
				styles: {},
			},
			{
				text: 'Test text',
				classes: {
					$$type: 'classes',
					value: [ 'new-style-id' ],
				},
			},
			{
				'new-style-id': {
					id: 'new-style-id',
					label: 'Container Style 1',
					type: 'class',
					variants: [
						{
							meta: { breakpoint: null, state: null },
							props: { color: 'red' },
						},
					],
				},
			},
		],
		[
			'create a new style definition, a new variant, update props and update the reference in the settings without deleting old references',
			{ bind: 'classes', meta: { breakpoint: null, state: null }, props: { color: 'black' } },
			{
				label: 'Container',
				settings: {
					text: 'Test text',
					classes: {
						$$type: 'classes',
						value: [ 'existing-style-id' ],
					},
				},
				styles: {
					'existing-style-id': {
						id: 'existing-style-id',
						label: 'Container Style 1',
						type: 'class',
						variants: [
							{
								meta: { breakpoint: null, state: null },
								props: { color: 'red' },
							},
						],
					},
				},
			},
			{
				text: 'Test text',
				classes: {
					$$type: 'classes',
					value: [ 'existing-style-id', 'new-style-id' ],
				},
			},
			{
				'existing-style-id': {
					id: 'existing-style-id',
					label: 'Container Style 1',
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
					label: 'Container Style 2',
					type: 'class',
					variants: [
						{
							meta: { breakpoint: null, state: null },
							props: { color: 'black' },
						},
					],
				},
			},
		],
		[
			'add a new variant to existing style definition and update props',
			{ styleDefID: 'existing-style-id', bind: 'classes', meta: { breakpoint: null, state: 'active' }, props: { color: 'black' } },
			{
				label: 'Container',
				settings: {
					text: 'Test text',
					classes: {
						$$type: 'classes',
						value: [ 'existing-style-id' ],
					},
				},
				styles: {
					'existing-style-id': {
						id: 'existing-style-id',
						label: 'Container Style 1',
						type: 'class',
						variants: [
							{
								meta: { breakpoint: null, state: null },
								props: { color: 'red' },
							},
						],
					},
				},
			},
			{
				text: 'Test text',
				classes: {
					$$type: 'classes',
					value: [ 'existing-style-id' ],
				},
			},
			{
				'existing-style-id': {
					id: 'existing-style-id',
					label: 'Container Style 1',
					type: 'class',
					variants: [
						{
							meta: { breakpoint: null, state: null },
							props: { color: 'red' },
						},
						{
							meta: { breakpoint: null, state: 'active' },
							props: { color: 'black' },
						},
					],
				},
			},
		],
		[
			'update props without deleting old props',
			{ styleDefID: 'existing-style-id', bind: 'classes', meta: { breakpoint: null, state: null }, props: { color: 'black' } },
			{
				label: 'Container',
				settings: {
					text: 'Test text',
					classes: {
						$$type: 'classes',
						value: [ 'existing-style-id' ],
					},
				},
				styles: {
					'existing-style-id': {
						id: 'existing-style-id',
						label: 'Container Style 1',
						type: 'class',
						variants: [
							{
								meta: { breakpoint: null, state: null },
								props: { width: '10px', color: 'red' },
							},
						],
					},
				},
			},
			{
				text: 'Test text',
				classes: {
					$$type: 'classes',
					value: [ 'existing-style-id' ],
				},
			},
			{
				'existing-style-id': {
					id: 'existing-style-id',
					label: 'Container Style 1',
					type: 'class',
					variants: [
						{
							meta: { breakpoint: null, state: null },
							props: { width: '10px', color: 'black' },
						},
					],
				},
			},
		],
	] )( 'should %s', async ( description, applyArgs, containerArgs, expectedSettings, expectedStyles ) => {
		// Need to import dynamically since the command extends a global variable which isn't available in regular import.
		const StylesCommand = ( await import( 'elementor/modules/atomic-widgets/assets/js/editor/commands/styles' ) ).default;

		// Mock generateId
		createStyleCommand.randomId = () => 'new-style-id';

		const container = createContainer( {
			widgetType: 'a-heading',
			elType: 'widget',
			id: '123',
			...containerArgs,
		} );

		// Act
		new StylesCommand().apply( { container, ...applyArgs } );

		// Assert
		expect( container.model.get( 'styles' ) ).toEqual( expectedStyles );
		expect( container.model.get( 'settings' ).toJSON() ).toEqual( expectedSettings );
	} );
} );
