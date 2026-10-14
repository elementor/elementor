jest.mock( 'elementor-dynamic-tags/tag', () => class Tag {} );

describe( 'assets/dev/js/editor/components/dynamic-tags/manager.js', () => {
	let DynamicTagsManager;
	let manager;
	let ajaxAddRequest;

	beforeEach( async () => {
		global._ = {
			debounce: ( fn ) => fn,
		};

		global.elementorModules = {
			Module: {
				extend: ( proto ) => {
					class Manager {
						constructor() {
							Object.assign( this, proto );
							if ( this.onInit ) {
								this.onInit();
							}
						}
					}

					return Manager;
				},
			},
			editor: {
				elements: {
					models: {
						BaseSettings: class {
							constructor( settings ) {
								this.settings = settings;
							}
						},
					},
				},
			},
		};

		global.elementor = {
			config: {
				document: {
					id: 100,
				},
				dynamicTags: {
					tags: {
						'test-tag': {
							controls: {},
						},
					},
				},
			},
		};

		ajaxAddRequest = jest.fn();
		global.elementorCommon = {
			ajax: {
				addRequest: ajaxAddRequest,
			},
			helpers: {
				getUniqueId: () => 'unique-id',
			},
		};

		jest.isolateModules( () => {
			DynamicTagsManager = require( 'elementor/assets/dev/js/editor/components/dynamic-tags/manager.js' );
		} );

		manager = new DynamicTagsManager();
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	function createTagStub( postId ) {
		return {
			getOption: ( key ) => ( 'name' === key ? 'test-tag' : null ),
			model: {},
			editorRenderPostId: postId,
		};
	}

	it( 'addCacheRequest buckets by editorRenderPostId when set, otherwise by document id', () => {
		// Arrange.
		const alternatePostTag = createTagStub( 42 );
		const documentPostTag = createTagStub( undefined );

		// Act.
		manager.addCacheRequest( alternatePostTag );
		manager.addCacheRequest( documentPostTag );

		// Assert.
		expect( manager.cacheRequests[ 42 ] ).toBeDefined();
		expect( manager.cacheRequests[ 100 ] ).toBeDefined();
		expect( Object.keys( manager.cacheRequests[ 42 ] ).length ).toBe( 1 );
		expect( Object.keys( manager.cacheRequests[ 100 ] ).length ).toBe( 1 );
	} );

	it( 'loadCacheRequests fires one render_tags request per post id bucket', () => {
		// Arrange.
		const tagOne = createTagStub( 1 );
		const tagTwo = createTagStub( 2 );
		const callback = jest.fn();

		manager.addCacheRequest( tagOne );
		manager.addCacheRequest( tagTwo );
		manager.cacheCallbacks.push( { callback } );

		ajaxAddRequest.mockImplementation( ( action, options ) => {
			options.success( {} );
		} );

		// Act.
		manager.loadCacheRequests();

		// Assert.
		expect( ajaxAddRequest ).toHaveBeenCalledTimes( 2 );
		expect( ajaxAddRequest ).toHaveBeenCalledWith(
			'render_tags',
			expect.objectContaining( {
				data: expect.objectContaining( { post_id: 1 } ),
			} ),
		);
		expect( ajaxAddRequest ).toHaveBeenCalledWith(
			'render_tags',
			expect.objectContaining( {
				data: expect.objectContaining( { post_id: 2 } ),
			} ),
		);
		expect( callback ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'loadTagDataFromCache returns cached value for the matching post id', () => {
		// Arrange.
		const tag = createTagStub( 42 );
		const cacheKey = manager.createCacheKey( tag );

		manager.cache[ cacheKey ] = 'post-42-value';

		// Act.
		const value = manager.loadTagDataFromCache( tag );

		// Assert.
		expect( value ).toBe( 'post-42-value' );
	} );

	it( 'loadCacheRequests invokes callbacks when there are no pending requests', () => {
		// Arrange.
		const callback = jest.fn();

		manager.cacheCallbacks.push( { callback } );

		// Act.
		manager.loadCacheRequests();

		// Assert.
		expect( ajaxAddRequest ).not.toHaveBeenCalled();
		expect( callback ).toHaveBeenCalledTimes( 1 );
	} );
} );
