describe( 'AtomicListModel', () => {
	let AtomicElementBaseModel;
	let AtomicListModel;

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
					'e-list': {
						children_dependencies: [],
					},
				},
			},
		};

		global.$e = { commands: { currentTrace: [] } };
		global.elementorCommon = { helpers: { getUniqueId: () => 'uid' } };
		global.sessionStorage = {
			getItem: jest.fn(),
			setItem: jest.fn(),
			removeItem: jest.fn(),
		};

		AtomicElementBaseModel = ( await import( 'elementor/modules/atomic-widgets/assets/js/editor/atomic-element-base-model' ) ).default;
		AtomicListModel = ( await import( 'elementor/modules/atomic-widgets/assets/js/editor/atomic-list-model' ) ).default;
	} );

	beforeEach( () => {
		global.sessionStorage.getItem.mockReset();
		global.sessionStorage.setItem.mockReset();
		global.sessionStorage.removeItem.mockReset();
		AtomicElementBaseModel.setChildrenDependenciesAdapter( null );
	} );

	afterAll( () => {
		delete global.elementor;
		delete global.$e;
		delete global.elementorCommon;
		delete global.sessionStorage;
	} );

	it( 'preserves list marker reconciliation when the base model resets attributes.elements', () => {
		const marker = {
			id: 'marker-1',
			elType: 'e-list-item-marker',
			elements: [],
		};
		const content = {
			id: 'content-1',
			elType: 'e-list-item-content',
			elements: [],
		};
		const listItem = {
			id: 'item-1',
			elType: 'e-list-item',
			elements: [ marker, content ],
		};
		const model = new AtomicListModel();

		model.set( 'id', 'list-1' );
		model.set( 'elType', 'e-list' );
		model.set( 'elements', [ listItem ] );

		model.initialize( {
			elements: [ listItem ],
			settings: {
				show_markers: {
					value: false,
				},
			},
		}, {} );

		expect( model.get( 'elements' ) ).toEqual( [
			{
				id: 'item-1',
				elType: 'e-list-item',
				elements: [ content ],
			},
		] );
		expect( global.sessionStorage.setItem ).toHaveBeenCalledWith(
			'elementor/editor-state/item-1/children-deps/e-list-item-marker',
			JSON.stringify( marker ),
		);
	} );
} );
