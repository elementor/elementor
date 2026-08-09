describe( 'AtomicListModel', () => {
	let AtomicElementBaseModel;
	let AtomicListModel;
	let getContainerMock;
	let addModelToParentMock;
	let removeModelFromParentMock;
	let bindMock;
	let detachMock;

	beforeAll( async () => {
		jest.resetModules();

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

			initialize() {}

			once( event, callback ) {
				const callbacks = this._events.get( event ) ?? [];
				callbacks.push( callback );
				this._events.set( event, callbacks );
			}

			trigger( event, ...args ) {
				( this._events.get( event ) ?? [] ).forEach( ( callback ) => callback( ...args ) );
			}
		}

		global.elementor = {
			modules: { elements: { models: { Element: BaseElementModel } } },
			config: {
				elements: {
					'e-list': {
						children_dependencies: [],
					},
				},
			},
			hooks: {
				addFilter: jest.fn(),
			},
		};
		global.$e = { commands: { currentTrace: [] } };
		global.elementorCommon = { helpers: { getUniqueId: () => 'uid' } };

		getContainerMock = jest.fn();
		addModelToParentMock = jest.fn();
		removeModelFromParentMock = jest.fn();
		bindMock = jest.fn();
		detachMock = jest.fn();
		bindMock.mockReturnValue( detachMock );

		AtomicElementBaseModel = ( await import( 'elementor/modules/atomic-widgets/assets/js/editor/atomic-element-base-model' ) ).default;
		AtomicListModel = ( await import( 'elementor/modules/atomic-widgets/assets/js/editor/atomic-list-model' ) ).default;

		AtomicElementBaseModel.setChildrenDependenciesAdapter( {
			reconcileInitialChildren: jest.fn(),
			bindSettingsReconcile: bindMock,
			getContainer: getContainerMock,
			addModelToParent: addModelToParentMock,
			removeModelFromParent: removeModelFromParentMock,
		} );
	} );

	beforeEach( () => {
		getContainerMock.mockClear();
		addModelToParentMock.mockClear();
		removeModelFromParentMock.mockClear();
		bindMock.mockClear();
		detachMock.mockClear();
		sessionStorage.clear();
	} );

	afterAll( () => {
		delete global.elementor;
		delete global.$e;
		delete global.elementorCommon;
		AtomicElementBaseModel.setChildrenDependenciesAdapter( null );
	} );

	const createModel = ( { id = 'list-1', settings } = {} ) => {
		const model = new AtomicListModel();
		model.set( 'id', id );
		model.set( 'elType', 'e-list' );
		model.set( 'elements', [] );
		model.set( 'settings', settings );
		return model;
	};

	const createReactiveSettings = ( initial ) => {
		let current = { ...initial };
		const listeners = [];

		return {
			get: ( key ) => current[ key ],
			set: ( next ) => {
				current = { ...current, ...next };
				listeners.forEach( ( callback ) => callback() );
			},
			on: jest.fn( ( _event, callback ) => listeners.push( callback ) ),
			off: jest.fn( ( _event, callback ) => {
				const index = listeners.indexOf( callback );

				if ( index >= 0 ) {
					listeners.splice( index, 1 );
				}
			} ),
		};
	};

	it( 'removes list-item markers from initial list data when show_markers is off', () => {
		const listItem = {
			elType: 'e-list-item',
			id: 'item-1',
			elements: [
				{ elType: 'e-list-item-marker', id: 'marker-1', elements: [ { elType: 'widget', widgetType: 'e-svg' } ] },
				{ elType: 'e-list-item-content', id: 'content-1', elements: [] },
			],
		};
		const model = createModel();

		model.initialize(
			{
				elements: [ listItem ],
				settings: {
					show_markers: {
						$$type: 'boolean',
						value: false,
					},
				},
			},
			{}
		);

		expect( model.get( 'elements' ) ).toEqual( [
			expect.objectContaining( {
				elType: 'e-list-item',
				elements: [
					expect.objectContaining( {
						elType: 'e-list-item-content',
					} ),
				],
			} ),
		] );
		expect(
			sessionStorage.getItem( 'elementor/editor-state/item-1/children-deps/e-list-item-marker' )
		).toContain( '"elType":"e-list-item-marker"' );
	} );

	it( 'removes and restores list-item markers when show_markers changes', () => {
		const settings = createReactiveSettings( {
			show_markers: {
				$$type: 'boolean',
				value: true,
			},
		} );
		const markerChild = {
			id: 'marker-1',
			model: {
				get: ( key ) => ( key === 'elType' ? 'e-list-item-marker' : undefined ),
				toJSON: () => ( { elType: 'e-list-item-marker', id: 'marker-1', elements: [] } ),
			},
		};
		const contentChild = {
			id: 'content-1',
			model: {
				get: ( key ) => ( key === 'elType' ? 'e-list-item-content' : undefined ),
				toJSON: () => ( { elType: 'e-list-item-content', id: 'content-1', elements: [] } ),
			},
		};
		const listItemContainer = {
			id: 'item-1',
			children: [ markerChild, contentChild ],
		};
		const listContainer = {
			id: 'list-1',
			children: [
				{
					id: 'item-1',
					model: {
						get: ( key ) => ( key === 'elType' ? 'e-list-item' : undefined ),
					},
				},
			],
		};
		const dispatchSpy = jest.spyOn( window, 'dispatchEvent' );
		const model = createModel( {
			settings,
		} );

		getContainerMock.mockImplementation( ( id ) => {
			if ( 'list-1' === id ) {
				return listContainer;
			}

			if ( 'item-1' === id ) {
				return listItemContainer;
			}

			return undefined;
		} );

		removeModelFromParentMock.mockImplementation( () => {
			listItemContainer.children = [ contentChild ];
			return true;
		} );
		addModelToParentMock.mockImplementation( () => {
			listItemContainer.children = [ markerChild, contentChild ];
			return true;
		} );

		model.initialize( {}, {} );

		settings.set( {
			show_markers: {
				$$type: 'boolean',
				value: false,
			},
		} );

		expect( removeModelFromParentMock ).toHaveBeenCalledWith( 'item-1', 'marker-1' );

		settings.set( {
			show_markers: {
				$$type: 'boolean',
				value: true,
			},
		} );

		expect( addModelToParentMock ).toHaveBeenCalledWith(
			'item-1',
			expect.objectContaining( { elType: 'e-list-item-marker', id: 'marker-1' } ),
			{ at: 0 }
		);
		expect(
			dispatchSpy.mock.calls
				.map( ( args ) => args[ 0 ] )
				.filter( ( event ) => event.type === 'elementor/navigator/refresh-children' )
		).toHaveLength( 2 );

		dispatchSpy.mockRestore();
	} );
} );
