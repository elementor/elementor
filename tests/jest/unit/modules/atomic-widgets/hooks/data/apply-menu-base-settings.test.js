import { createContainer, setGlobalContainers } from '../../utils/container';

describe( 'Apply menu base settings', () => {
	let hook;

	const collapseBreakpoint = ( value ) => ( { $$type: 'string', value } );

	const createMenu = ( settings = {} ) => createContainer( { elType: 'e-menu', id: 'menu1', settings } );

	beforeAll( async () => {
		global.$e = {
			modules: { hookData: { After: class {} } },
			internal: jest.fn(),
		};

		const { CreateElement } = await import( 'elementor/modules/atomic-widgets/assets/js/editor/hooks/data/apply-menu-base-settings/create-element' );

		hook = new CreateElement();
	} );

	afterAll( () => {
		delete global.$e;
		delete global.elementor;
	} );

	beforeEach( () => {
		setGlobalContainers( [] );
		global.elementor.config = {
			elements: {
				'e-menu': { base_settings: { 'collapse-breakpoint': collapseBreakpoint( 'tablet' ) } },
			},
		};
		global.$e.internal.mockClear();
	} );

	it( 'should store the base settings on a newly created menu', () => {
		// Arrange.
		const menu = createMenu();

		// Act.
		hook.apply( {}, menu );

		// Assert.
		expect( global.$e.internal ).toHaveBeenCalledWith( 'document/elements/set-settings', {
			container: menu,
			settings: { 'collapse-breakpoint': collapseBreakpoint( 'tablet' ) },
			options: { render: false },
		} );
	} );

	it( 'should find a menu created inside a wrapper', () => {
		// Arrange.
		const menu = createMenu();
		const wrapper = createContainer( { elType: 'e-flexbox', id: 'wrapper1' } );
		wrapper.children = [ menu ];

		// Act.
		hook.apply( {}, wrapper );

		// Assert.
		expect( global.$e.internal ).toHaveBeenCalledTimes( 1 );
		expect( global.$e.internal.mock.calls[ 0 ][ 1 ].container ).toBe( menu );
	} );

	it( 'should not override a setting that already has a value', () => {
		// Arrange.
		const menu = createMenu( { 'collapse-breakpoint': collapseBreakpoint( 'mobile' ) } );

		// Act.
		hook.apply( {}, menu );

		// Assert.
		expect( global.$e.internal ).not.toHaveBeenCalled();
	} );

	it( 'should not touch other element types', () => {
		// Arrange.
		const flexbox = createContainer( { elType: 'e-flexbox', id: 'wrapper1' } );

		// Act.
		hook.apply( {}, flexbox );

		// Assert.
		expect( global.$e.internal ).not.toHaveBeenCalled();
	} );
} );
