describe( 'Apply menu base settings', () => {
	let hook;

	const collapseBreakpoint = ( value ) => ( { $$type: 'string', value } );

	const createModel = ( elType, { settings = {}, elements = [] } = {} ) => {
		const settingsStore = { ...settings };

		return {
			get: ( key ) => ( {
				elType,
				settings: {
					get: ( settingKey ) => settingsStore[ settingKey ],
					set: ( values ) => Object.assign( settingsStore, values ),
				},
				elements: { models: elements },
			}[ key ] ),
			settingsStore,
		};
	};

	const createContainer = ( model ) => ( { model } );

	beforeAll( async () => {
		global.$e = { modules: { hookData: { After: class {} } } };
		global.elementor = {};

		const { CreateElement } = await import( 'elementor/modules/atomic-widgets/assets/js/editor/hooks/data/apply-menu-base-settings/create-element' );

		hook = new CreateElement();
	} );

	afterAll( () => {
		delete global.$e;
		delete global.elementor;
	} );

	beforeEach( () => {
		global.elementor.config = {
			elements: {
				'e-menu': { base_settings: { 'collapse-breakpoint': collapseBreakpoint( 'tablet' ) } },
			},
		};
	} );

	it( 'should store the base settings on a newly created menu', () => {
		// Arrange.
		const menu = createModel( 'e-menu' );

		// Act.
		hook.apply( {}, createContainer( menu ) );

		// Assert.
		expect( menu.settingsStore ).toEqual( { 'collapse-breakpoint': collapseBreakpoint( 'tablet' ) } );
	} );

	it( 'should find a menu created inside a wrapper before its container children exist', () => {
		// Arrange.
		const menu = createModel( 'e-menu' );
		const wrapper = createModel( 'e-flexbox', { elements: [ menu ] } );

		// Act.
		hook.apply( {}, createContainer( wrapper ) );

		// Assert.
		expect( menu.settingsStore ).toEqual( { 'collapse-breakpoint': collapseBreakpoint( 'tablet' ) } );
	} );

	it( 'should not override a setting that already has a value', () => {
		// Arrange.
		const menu = createModel( 'e-menu', { settings: { 'collapse-breakpoint': collapseBreakpoint( 'mobile' ) } } );

		// Act.
		hook.apply( {}, createContainer( menu ) );

		// Assert.
		expect( menu.settingsStore[ 'collapse-breakpoint' ] ).toEqual( collapseBreakpoint( 'mobile' ) );
	} );

	it( 'should not touch other element types', () => {
		// Arrange.
		const flexbox = createModel( 'e-flexbox' );

		// Act.
		hook.apply( {}, createContainer( flexbox ) );

		// Assert.
		expect( flexbox.settingsStore ).toEqual( {} );
	} );
} );
