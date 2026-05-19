describe( 'createAtomicElementBaseView - components Pro gating', () => {
	let AtomicElementView;
	let viewInstance;
	let mockModel;
	let dispatchEventSpy;

	beforeAll( async () => {
		jest.resetModules();

		global.Marionette = {
			ItemView: class {},
			CompositeView: {
				prototype: {
					getChildViewContainer: jest.fn(),
				},
			},
			TemplateCache: {
				get: jest.fn( () => '<div></div>' ),
			},
		};

		global.jQuery = jest.fn( () => ( {
			children: jest.fn( () => ( { append: jest.fn() } ) ),
		} ) );

		global.elementorCommon = {
			config: {
				isRTL: false,
				experimentalFeatures: { e_components: true },
			},
		};

		const BaseElementView = class {
			static extend( props ) {
				const Extended = class extends this {};
				Object.assign( Extended.prototype, props );
				return Extended;
			}
		};

		BaseElementView.prototype.attributes = jest.fn( () => ( {} ) );
		BaseElementView.prototype.className = jest.fn( () => '' );
		BaseElementView.prototype.renderOnChange = jest.fn();
		BaseElementView.prototype.behaviors = jest.fn( () => ( {} ) );
		BaseElementView.prototype.ui = jest.fn( () => ( {} ) );
		BaseElementView.prototype.getContextMenuGroups = jest.fn( () => [
			{ name: 'general', actions: [] },
			{ name: 'clipboard', actions: [] },
		] );

		global._ = {
			extend: Object.assign,
			findWhere: ( arr, props ) => arr.find(
				( item ) => Object.keys( props ).every( ( key ) => item[ key ] === props[ key ] ),
			),
		};

		global.elementor = {
			modules: {
				elements: {
					views: { BaseElement: BaseElementView },
				},
			},
			config: {
				elements: {},
				user: { is_administrator: true },
			},
			helpers: { getAtomicWidgetBaseStyles: jest.fn( () => ( {} ) ) },
			$preview: [ { getBoundingClientRect: () => ( { left: 0, top: 0 } ) } ],
			getContainer: jest.fn( () => ( { model: { toJSON: () => ( {} ) } } ) ),
		};

		const createAtomicElementBaseView = ( await import( 'elementor/modules/atomic-widgets/assets/js/editor/create-atomic-element-base-view' ) ).default;
		AtomicElementView = createAtomicElementBaseView( 'e-div-block' );
	} );

	beforeEach( () => {
		mockModel = {
			get: jest.fn( () => undefined ),
			id: 'test-element',
		};

		viewInstance = new AtomicElementView();
		viewInstance.model = mockModel;
		viewInstance.getContainer = jest.fn( () => ( { isLocked: () => false } ) );
		dispatchEventSpy = jest.spyOn( window, 'dispatchEvent' ).mockImplementation( () => {} );

		jest.clearAllMocks();
	} );

	afterEach( () => {
		dispatchEventSpy?.mockRestore();
	} );

	afterAll( () => {
		delete global.Marionette;
		delete global.jQuery;
		delete global.elementorCommon;
		delete global.elementor;
		delete global._;
		if ( global.window ) {
			delete global.window.elementorV2;
		}
	} );

	const setProState = ( { isActive, hasInstalled = false, isAtLeast = false } = {} ) => {
		global.window = global.window || {};
		global.window.elementorV2 = {
			...( global.window.elementorV2 || {} ),
			utils: {
				isProActive: jest.fn( () => isActive ),
				hasProInstalled: jest.fn( () => hasInstalled ),
				isProAtLeast: jest.fn( () => isAtLeast ),
			},
		};
	};

	const findCreateAction = ( groups ) => {
		const saveGroup = groups.find( ( g ) => 'save' === g.name );
		return saveGroup?.actions?.find( ( a ) => 'save-component' === a.name );
	};

	it( 'should show new badge and enable create-component when Pro is active', () => {
		// Arrange
		setProState( { isActive: true, hasInstalled: true, isAtLeast: true } );

		// Act
		const action = findCreateAction( viewInstance.getContextMenuGroups() );

		// Assert
		expect( action ).toBeDefined();
		expect( action.shortcut ).toContain( 'new-badge' );
		expect( action.shortcut ).toContain( 'New' );
		expect( action.isEnabled() ).toBe( true );
	} );

	it( 'should show promotion crown badge and disable create-component when Pro is not installed', () => {
		// Arrange
		setProState( { isActive: false } );

		// Act
		const action = findCreateAction( viewInstance.getContextMenuGroups() );

		// Assert
		expect( action ).toBeDefined();
		expect( action.shortcut ).toContain( 'eicon-upgrade-crown' );
		expect( action.shortcut ).toContain( 'go-pro-components-Instance-create-context-menu' );
		expect( action.isEnabled() ).toBe( false );
	} );

	it( 'should default to active when elementorV2 is not available', () => {
		// Arrange
		delete global.window.elementorV2;

		// Act
		const action = findCreateAction( viewInstance.getContextMenuGroups() );

		// Assert
		expect( action ).toBeDefined();
		expect( action.shortcut ).toContain( 'new-badge' );
		expect( action.isEnabled() ).toBe( true );
	} );

	it( 'should not add create-component when user is not administrator', () => {
		// Arrange
		setProState( { isActive: true, hasInstalled: true, isAtLeast: true } );
		global.elementor.config.user.is_administrator = false;

		// Act
		const action = findCreateAction( viewInstance.getContextMenuGroups() );

		// Assert
		expect( action ).toBeUndefined();

		// Cleanup
		global.elementor.config.user.is_administrator = true;
	} );

	it( 'should block saveAsComponent when Pro is not active', () => {
		// Arrange
		global.window.elementorV2 = {
			utils: {
				isProActive: () => false,
				hasProInstalled: () => false,
				isProAtLeast: () => false,
			},
		};

		// Act
		viewInstance.saveAsComponent( { originalEvent: { clientX: 0, clientY: 0 } } );

		// Assert
		expect( dispatchEventSpy ).not.toHaveBeenCalled();
	} );

	it( 'should allow saveAsComponent when Pro is active', () => {
		// Arrange
		global.window.elementorV2 = {
			utils: {
				isProActive: () => true,
				hasProInstalled: () => true,
				isProAtLeast: () => true,
			},
		};

		// Act
		viewInstance.saveAsComponent( { originalEvent: { clientX: 0, clientY: 0 } } );

		// Assert
		expect( dispatchEventSpy ).toHaveBeenCalledWith(
			expect.objectContaining( { type: 'elementor/editor/open-save-as-component-form' } ),
		);
	} );

	it( 'should allow saveAsComponent when elementorV2 is not available (defaults to active)', () => {
		// Arrange
		delete global.window.elementorV2;

		// Act
		viewInstance.saveAsComponent( { originalEvent: { clientX: 0, clientY: 0 } } );

		// Assert
		expect( dispatchEventSpy ).toHaveBeenCalledWith(
			expect.objectContaining( { type: 'elementor/editor/open-save-as-component-form' } ),
		);
	} );

	it( 'should show new badge and enable create-component when Pro is outdated', () => {
		// Arrange
		setProState( { isActive: false, hasInstalled: true, isAtLeast: false } );

		// Act
		const action = findCreateAction( viewInstance.getContextMenuGroups() );

		// Assert
		expect( action ).toBeDefined();
		expect( action.shortcut ).toContain( 'new-badge' );
		expect( action.shortcut ).not.toContain( 'eicon-upgrade-crown' );
		expect( action.isEnabled() ).toBe( true );
	} );

	it( 'should show info notification and block saveAsComponent when Pro is outdated', () => {
		// Arrange
		const notifySpy = jest.fn();
		global.window.elementorV2 = {
			utils: {
				isProActive: () => false,
				hasProInstalled: () => true,
				isProAtLeast: () => false,
			},
			editorNotifications: { notify: notifySpy },
		};

		// Act
		viewInstance.saveAsComponent( { originalEvent: { clientX: 0, clientY: 0 } } );

		// Assert
		expect( dispatchEventSpy ).not.toHaveBeenCalled();
		expect( notifySpy ).toHaveBeenCalledWith(
			expect.objectContaining( {
				type: 'info',
				id: 'component-create-update',
			} ),
		);
	} );
} );
