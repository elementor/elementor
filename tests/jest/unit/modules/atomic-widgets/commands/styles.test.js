import createContainer from '../createContainer';

describe( 'Styles - apply', () => {
	let setSettingsCommand, createStyleCommand, createVariantCommand, updatePropsCommand;

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

		const SetSettingsCommand = ( await import( 'elementor-document/elements/commands-internal/set-settings' ) ).default;

		const CreateStyleCommand = ( await import( 'elementor-document/atomic-widgets/commands-internal/create-style' ) ).default;

		const CreateVariantCommand = ( await import( 'elementor-document/atomic-widgets/commands-internal/create-variant' ) ).default;

		const UpdatePropsCommand = ( await import( 'elementor-document/atomic-widgets/commands-internal/update-props' ) ).default;

		setSettingsCommand = new SetSettingsCommand();
		createStyleCommand = new CreateStyleCommand();
		createVariantCommand = new CreateVariantCommand();
		updatePropsCommand = new UpdatePropsCommand();

		global.$e.internal = ( command, args ) => {
			switch ( command ) {
				case 'document/elements/set-settings':
					return setSettingsCommand.apply( args );
				case 'document/atomic-widgets/create-style':
					return createStyleCommand.apply( args );
				case 'document/atomic-widgets/create-variant':
					return createVariantCommand.apply( args );
				case 'document/atomic-widgets/update-props':
					return updatePropsCommand.apply( args );
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
			'create new style object, new variant, update props and update the reference in the settings',
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
			'create new style object, new variant, update props and update the reference in the settings without deleting old references',
			{ bind: 'classes', meta: { breakpoint: null, state: null }, props: { color: 'black' } },
			{
				label: 'Container',
				settings: {
					text: 'Test text',
					classes: {
						$$type: 'classes',
						value: [ 'exits-style-id' ],
					},
				},
				styles: {
					'exits-style-id': {
						id: 'exits-style-id',
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
					value: [ 'exits-style-id', 'new-style-id' ],
				},
			},
			{
				'exits-style-id': {
					id: 'exits-style-id',
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
			'create add new variant to exits and update props',
			{ styleDefId: 'exits-style-id', bind: 'classes', meta: { breakpoint: null, state: 'active' }, props: { color: 'black' } },
			{
				label: 'Container',
				settings: {
					text: 'Test text',
					classes: {
						$$type: 'classes',
						value: [ 'exits-style-id' ],
					},
				},
				styles: {
					'exits-style-id': {
						id: 'exits-style-id',
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
					value: [ 'exits-style-id' ],
				},
			},
			{
				'exits-style-id': {
					id: 'exits-style-id',
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
			{ styleDefId: 'exits-style-id', bind: 'classes', meta: { breakpoint: null, state: null }, props: { color: 'black' } },
			{
				label: 'Container',
				settings: {
					text: 'Test text',
					classes: {
						$$type: 'classes',
						value: [ 'exits-style-id' ],
					},
				},
				styles: {
					'exits-style-id': {
						id: 'exits-style-id',
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
					value: [ 'exits-style-id' ],
				},
			},
			{
				'exits-style-id': {
					id: 'exits-style-id',
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
		const StylesCommand = ( await import( 'elementor-document/atomic-widgets/commands/styles' ) ).default;

		// Mock generateId
		createStyleCommand.randomId = () => 'new-style-id';

		const container = createContainer( {
			widgetType: 'a-heading',
			elType: 'widget',
			id: '123',
			...containerArgs,
		} );

		// Act
		await new StylesCommand().apply( { container, ...applyArgs } );

		// Assert
		expect( container.model.get( 'styles' ) ).toEqual( expectedStyles );
		expect( container.model.get( 'settings' ).toJSON() ).toEqual( expectedSettings );
	} );
} );
