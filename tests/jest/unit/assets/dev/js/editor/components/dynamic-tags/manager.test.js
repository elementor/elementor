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

	it( 'addCacheRequest queues document post tags in flat cacheRequests', () => {
		// Arrange.
		const documentTag = createTagStub( 100 );

		// Act.
		manager.addCacheRequest( documentTag );

		// Assert.
		expect( Object.keys( manager.cacheRequests ).length ).toBe( 1 );
		expect( manager.batchCacheRequests[ 100 ] ).toBeUndefined();
	} );

	it( 'addCacheRequest buckets alternate post tags in batchCacheRequests', () => {
		// Arrange.
		const tagOne = createTagStub( 1 );
		const tagTwo = createTagStub( 2 );

		// Act.
		manager.addCacheRequest( tagOne );
		manager.addCacheRequest( tagTwo );

		// Assert.
		expect( manager.cacheRequests ).toEqual( {} );
		expect( manager.batchCacheRequests[ 1 ] ).toBeDefined();
		expect( manager.batchCacheRequests[ 2 ] ).toBeDefined();
		expect( Object.keys( manager.batchCacheRequests[ 1 ] ).length ).toBe( 1 );
		expect( Object.keys( manager.batchCacheRequests[ 2 ] ).length ).toBe( 1 );
	} );

	it( 'loadCacheRequests sends render_tags for document post and writes to cache only', () => {
		// Arrange.
		const documentTag = createTagStub( 100 );
		const callback = jest.fn();

		manager.addCacheRequest( documentTag );
		manager.cacheCallbacks.push( { callback } );

		ajaxAddRequest.mockImplementation( ( action, options ) => {
			options.success( { [ manager.createLegacyCacheKey( documentTag ) ]: 'legacy-resolved' } );
		} );

		// Act.
		manager.loadCacheRequestsImmediate();

		// Assert.
		expect( ajaxAddRequest ).toHaveBeenCalledWith(
			'render_tags',
			expect.objectContaining( {
				data: {
					post_id: 100,
					tags: expect.any( Array ),
				},
			} ),
		);
		expect( manager.cache[ manager.createLegacyCacheKey( documentTag ) ] ).toBe( 'legacy-resolved' );
		expect( manager.batchCache ).toEqual( {} );
		expect( callback ).toHaveBeenCalled();
	} );

	it( 'loadBatchCacheRequests sends render_tags_batch and writes to batchCache only', () => {
		// Arrange.
		const tagOne = createTagStub( 1 );
		const tagTwo = createTagStub( 2 );
		const callback = jest.fn();

		manager.addCacheRequest( tagOne );
		manager.addCacheRequest( tagTwo );
		manager.batchCacheCallbacks.push( { callback } );

		ajaxAddRequest.mockImplementation( ( action, options ) => {
			options.success( {
				[ manager.createBatchCacheKey( tagOne ) ]: 'batch-one',
				[ manager.createBatchCacheKey( tagTwo ) ]: 'batch-two',
			} );
		} );

		// Act.
		manager.loadBatchCacheRequestsImmediate();

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
		expect( manager.batchCache[ manager.createBatchCacheKey( tagOne ) ] ).toBe( 'batch-one' );
		expect( manager.cache ).toEqual( {} );
		expect( callback ).toHaveBeenCalled();
	} );

	it( 'loadTagDataFromCache reads alternate post values from batchCache', () => {
		// Arrange.
		const alternatePostTag = createTagStub( 42 );
		const batchCacheKey = manager.createBatchCacheKey( alternatePostTag );

		manager.batchCache[ batchCacheKey ] = 'from-batch-cache';

		// Act.
		const value = manager.loadTagDataFromCache( alternatePostTag );

		// Assert.
		expect( value ).toBe( 'from-batch-cache' );
		expect( manager.cache[ batchCacheKey ] ).toBeUndefined();
	} );

	it( 'prefetchTags resolves after batch request succeeds into batchCache', async () => {
		// Arrange.
		const cacheKey = manager.buildCacheKeyFor( 'test-tag', {}, 42 );

		ajaxAddRequest.mockImplementation( ( action, options ) => {
			options.success( { [ cacheKey ]: 'resolved' } );
		} );

		// Act.
		const prefetchPromise = manager.prefetchTags( { 42: [ cacheKey ] } );

		// Assert.
		await expect( prefetchPromise ).resolves.toBeUndefined();
		expect( manager.batchCache[ cacheKey ] ).toBe( 'resolved' );
		expect( manager.cache[ cacheKey ] ).toBeUndefined();
		expect( ajaxAddRequest ).toHaveBeenCalledWith( 'render_tags_batch', expect.any( Object ) );
	} );

	it( 'cleanCache clears cache and batchCache', () => {
		// Arrange.
		manager.cache = { legacy: 'value' };
		manager.batchCache = { batch: 'value' };
		manager.cacheRequests = { pending: true };
		manager.batchCacheRequests = { 1: { pending: true } };

		// Act.
		manager.cleanCache();

		// Assert.
		expect( manager.cache ).toEqual( {} );
		expect( manager.batchCache ).toEqual( {} );
		expect( manager.cacheRequests ).toEqual( {} );
		expect( manager.batchCacheRequests ).toEqual( {} );
	} );
} );
