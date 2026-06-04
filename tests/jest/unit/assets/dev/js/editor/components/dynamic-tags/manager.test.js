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

	it( 'addCacheRequest buckets cache keys by post id', () => {
		// Arrange.
		const tagOne = createTagStub( 1 );
		const tagTwo = createTagStub( 2 );

		// Act.
		manager.addCacheRequest( tagOne );
		manager.addCacheRequest( tagTwo );

		// Assert.
		expect( manager.cacheRequests[ 1 ] ).toBeDefined();
		expect( manager.cacheRequests[ 2 ] ).toBeDefined();
		expect( Object.keys( manager.cacheRequests[ 1 ] ).length ).toBe( 1 );
		expect( Object.keys( manager.cacheRequests[ 2 ] ).length ).toBe( 1 );
	} );

	it( 'loadCacheRequests sends a single render_tags_batch request with grouped tags', () => {
		// Arrange.
		const tagOne = createTagStub( 1 );
		const tagTwo = createTagStub( 2 );
		const callback = jest.fn();

		manager.addCacheRequest( tagOne );
		manager.addCacheRequest( tagTwo );
		manager.cacheCallbacks.push( { callback } );

		// Act.
		manager.loadCacheRequestsImmediate();

		// Assert.
		expect( ajaxAddRequest ).toHaveBeenCalledWith(
			'render_tags_batch',
			expect.objectContaining( {
				data: {
					groups: expect.arrayContaining( [
						expect.objectContaining( { post_id: 1 } ),
						expect.objectContaining( { post_id: 2 } ),
					] ),
				},
			} ),
		);
		expect( callback ).not.toHaveBeenCalled();
	} );

	it( 'prefetchTags resolves after batch request succeeds', async () => {
		// Arrange.
		const cacheKey = manager.buildCacheKeyFor( 'test-tag', {}, 42 );

		ajaxAddRequest.mockImplementation( ( action, options ) => {
			options.success( { [ cacheKey ]: 'resolved' } );
		} );

		// Act.
		const prefetchPromise = manager.prefetchTags( { 42: [ cacheKey ] } );

		// Assert.
		await expect( prefetchPromise ).resolves.toBeUndefined();
		expect( manager.cache[ cacheKey ] ).toBe( 'resolved' );
		expect( ajaxAddRequest ).toHaveBeenCalledWith( 'render_tags_batch', expect.any( Object ) );
	} );
} );
