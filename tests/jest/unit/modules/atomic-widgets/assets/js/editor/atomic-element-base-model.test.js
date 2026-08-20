describe( 'AtomicElementBaseModel - children dependencies wiring', () => {
	let AtomicElementBaseModel;
	let baseInitializeSpy;
	let reconcileMock;
	let bindMock;
	let detachMock;

	beforeAll( async () => {
		jest.resetModules();

		baseInitializeSpy = jest.fn();

		class BaseElementModel {
			constructor() {
				this._events = new Map();
			}

			get( key ) {
				return this._data?.[ key ];
			}

			set( key, value ) {
				this._data = this._data || {};
				this._data[ key ] = value;
			}

			unset( key ) {
				if ( this._data ) {
					delete this._data[ key ];
				}
			}

			initialize( attributes, options ) {
				baseInitializeSpy( attributes, options );
			}

			once( event, callback ) {
				this._events.set( event, callback );
			}

			trigger( event, ...args ) {
				this._events.get( event )?.( ...args );
			}
		}

		global.elementor = {
			modules: { elements: { models: { Element: BaseElementModel } } },
			config: {
				elements: {
					'e-loop': {
						children_dependencies: [
							{
								child_type: 'e-pagination',
								when: { relation: 'or', terms: [] },
								position: { kind: 'last', value: null },
								stash: true,
								default_model: null,
							},
						],
					},
					'e-simple': {
						children_dependencies: [],
					},
					'e-locked': { meta: { permanently_locked: true } },
				},
			},
		};

		global.$e = { commands: { currentTrace: [] } };

		global.elementorCommon = { helpers: { getUniqueId: () => 'uid' } };

		reconcileMock = jest.fn();
		bindMock = jest.fn();
		detachMock = jest.fn();
		bindMock.mockReturnValue( detachMock );

		AtomicElementBaseModel = ( await import( 'elementor/modules/atomic-widgets/assets/js/editor/atomic-element-base-model' ) ).default;

		AtomicElementBaseModel.setChildrenDependenciesAdapter( {
			reconcileInitialChildren: reconcileMock,
			bindSettingsReconcile: bindMock,
		} );
	} );

	beforeEach( () => {
		reconcileMock.mockClear();
		bindMock.mockClear();
		detachMock.mockClear();
		baseInitializeSpy.mockClear();
	} );

	afterAll( () => {
		delete global.elementor;
		delete global.$e;
		delete global.elementorCommon;
		AtomicElementBaseModel.setChildrenDependenciesAdapter( null );
	} );

	const createModel = ( { elType, elements = [], id = 'test-id' } ) => {
		const model = new AtomicElementBaseModel();
		model.set( 'id', id );
		model.set( 'elType', elType );
		model.set( 'elements', elements );
		return model;
	};

	it( 'calls reconcileInitialChildren before super.initialize', () => {
		// Arrange.
		const attributes = { elements: [], settings: {} };
		const invocationOrder = [];
		reconcileMock.mockImplementation( () => invocationOrder.push( 'reconcile' ) );
		baseInitializeSpy.mockImplementation( () => invocationOrder.push( 'super' ) );
		const model = createModel( { elType: 'e-loop' } );

		// Act.
		model.initialize( attributes, {} );

		// Assert.
		expect( reconcileMock ).toHaveBeenCalledWith( expect.objectContaining( {
			elementId: 'test-id',
			elementConfig: global.elementor.config.elements[ 'e-loop' ],
			attributes,
		} ) );
		expect( invocationOrder ).toEqual( [ 'reconcile', 'super' ] );
	} );

	it( 'calls bindSettingsReconcile after super.initialize', () => {
		// Arrange.
		const invocationOrder = [];
		baseInitializeSpy.mockImplementation( () => invocationOrder.push( 'super' ) );
		bindMock.mockImplementation( () => {
			invocationOrder.push( 'bind' );
			return detachMock;
		} );
		const model = createModel( { elType: 'e-loop' } );

		// Act.
		model.initialize( {}, {} );

		// Assert.
		expect( bindMock ).toHaveBeenCalledWith( expect.objectContaining( {
			model,
			elementConfig: global.elementor.config.elements[ 'e-loop' ],
		} ) );
		expect( invocationOrder ).toEqual( [ 'super', 'bind' ] );
	} );

	it( 'skips reconcile and bind when the widget has no children_dependencies', () => {
		// Arrange.
		const model = createModel( { elType: 'e-simple' } );

		// Act.
		model.initialize( {}, {} );

		// Assert.
		expect( reconcileMock ).not.toHaveBeenCalled();
		expect( bindMock ).not.toHaveBeenCalled();
	} );

	it( 'calls the returned detach function when the model destroys', () => {
		// Arrange.
		const model = createModel( { elType: 'e-loop' } );

		// Act.
		model.initialize( {}, {} );
		model.trigger( 'destroy' );

		// Assert.
		expect( detachMock ).toHaveBeenCalled();
	} );

	it( "syncs model.get('elements') with reconciler mutations to attributes.elements", () => {
		// Arrange - reconciler adds a pagination child by reassigning attributes.elements.
		const pagination = { elType: 'e-pagination', id: 'pag-1', settings: {} };
		reconcileMock.mockImplementation( ( { attributes } ) => {
			attributes.elements = [ ...( attributes.elements ?? [] ), pagination ];
		} );
		const model = createModel( { elType: 'e-loop', elements: [] } );

		// Act.
		model.initialize( { elements: [], settings: {} }, {} );

		// Assert - model reflects the reconciled children, not the pre-reconcile array.
		expect( model.get( 'elements' ) ).toEqual( [ pagination ] );
	} );

	it( 'passes onElementCreate defaults into the reconciler', () => {
		// Arrange - simulate document/elements/create + onElementCreate that seeds a default child.
		global.$e.commands.currentTrace = [ 'document/elements/create' ];

		const defaultChild = { elType: 'e-layout', id: 'layout-1' };
		const pagination = { elType: 'e-pagination', id: 'pag-1' };

		class WithDefaults extends AtomicElementBaseModel {
			getDefaultChildren() {
				return [ defaultChild ];
			}

			buildElement( element ) {
				return element;
			}
		}

		let observedByReconciler;
		reconcileMock.mockImplementation( ( { attributes } ) => {
			observedByReconciler = [ ...( attributes.elements ?? [] ) ];
			attributes.elements = [ ...( attributes.elements ?? [] ), pagination ];
		} );

		const model = new WithDefaults();
		model.set( 'id', 'test-id' );
		model.set( 'elType', 'e-loop' );
		model.set( 'elements', [] );

		// Act.
		model.initialize( { elements: [], settings: {} }, {} );

		// Assert - reconciler saw the default child; final model state has both.
		expect( observedByReconciler ).toEqual( [ defaultChild ] );
		expect( model.get( 'elements' ) ).toEqual( [ defaultChild, pagination ] );

		// Cleanup.
		global.$e.commands.currentTrace = [];
	} );

	it( 'runs onElementCreate when hydrateDefaultChildren flag is set (outside create trace)', () => {
		// Arrange - not inside document/elements/create.
		global.$e.commands.currentTrace = [];
		const defaultChild = { elType: 'e-child', id: 'child-1' };

		class WithDefaults extends AtomicElementBaseModel {
			getDefaultChildren() {
				return [ defaultChild ];
			}
			buildElement( element ) {
				return element;
			}
		}

		const model = new WithDefaults();
		model.set( 'id', 'test-id' );
		model.set( 'elType', 'e-simple' );
		model.set( 'elements', [] );
		model.set( 'hydrateDefaultChildren', true );

		// Act.
		model.initialize( { elements: [], settings: {} }, {} );

		// Assert - defaults were seeded and flag was cleared.
		expect( model.get( 'elements' ) ).toEqual( [ defaultChild ] );
		expect( model.get( 'hydrateDefaultChildren' ) ).toBeUndefined();
	} );

	it( 'ignores hydrateDefaultChildren when elements are already present', () => {
		// Arrange.
		global.$e.commands.currentTrace = [];
		const existing = { elType: 'e-existing', id: 'existing-1' };
		const defaultChild = { elType: 'e-child', id: 'child-1' };

		class WithDefaults extends AtomicElementBaseModel {
			getDefaultChildren() {
				return [ defaultChild ];
			}
			buildElement( element ) {
				return element;
			}
		}

		const model = new WithDefaults();
		model.set( 'id', 'test-id' );
		model.set( 'elType', 'e-simple' );
		model.set( 'elements', [ existing ] );
		model.set( 'hydrateDefaultChildren', true );

		// Act.
		model.initialize( { elements: [ existing ], settings: {} }, {} );

		// Assert - existing children preserved, no hydration triggered.
		expect( model.get( 'elements' ) ).toEqual( [ existing ] );
	} );

	it( 'propagates hydrateDefaultChildren to children with empty elements via buildElement', () => {
		// Arrange.
		const model = createModel( { elType: 'e-simple' } );

		// Act.
		const built = model.buildElement( { elType: 'e-child' } );

		// Assert.
		expect( built.hydrateDefaultChildren ).toBe( true );
	} );

	it( 'propagates hydrateDefaultChildren even when the child has explicit elements (receiver no-ops via isEmpty guard)', () => {
		const model = createModel( { elType: 'e-simple' } );

		const built = model.buildElement( {
			elType: 'e-child',
			elements: [ { elType: 'e-grandchild' } ],
		} );

		expect( built.hydrateDefaultChildren ).toBe( true );
	} );

	it( 'does not propagate hydrateDefaultChildren when the child opts out via skipDefaultChildren', () => {
		// Arrange.
		const model = createModel( { elType: 'e-simple' } );

		// Act.
		const built = model.buildElement( { elType: 'e-child', skipDefaultChildren: true } );

		// Assert.
		expect( built.hydrateDefaultChildren ).toBeUndefined();
	} );

	it( 'gracefully degrades to a no-op when the adapter is not set', () => {
		// Arrange.
		AtomicElementBaseModel.setChildrenDependenciesAdapter( null );
		const model = createModel( { elType: 'e-loop' } );

		// Act + Assert.
		expect( () => model.initialize( {}, {} ) ).not.toThrow();

		// Cleanup.
		AtomicElementBaseModel.setChildrenDependenciesAdapter( {
			reconcileInitialChildren: reconcileMock,
			bindSettingsReconcile: bindMock,
		} );
	} );
} );
