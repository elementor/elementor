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

	const DOCUMENT_POST_ID = 100;

	function createTagStub( postId ) {
		return {
			getOption: ( key ) => ( 'name' === key ? 'test-tag' : null ),
			model: {},
			editorRenderPostId: postId,
		};
	}

	it( 'addCacheRequest routes document-post tag to legacy flat cacheRequests', () => {
		// Arrange.
		const tag = createTagStub( DOCUMENT_POST_ID );
		const legacyKey = manager.createCacheKey( tag );

		// Act.
		manager.addCacheRequest( tag );

		// Assert.
		expect( manager.cacheRequests[ legacyKey ] ).toBe( true );
		expect( manager.batchCacheRequests ).toEqual( {} );
	} );

	it( 'addCacheRequest routes alternate-post tags into batchCacheRequests bucketed by post id', () => {
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

	it( 'loadCacheRequests sends a render_tags request for the document post and writes to cache', () => {
		// Arrange.
		const tag = createTagStub( DOCUMENT_POST_ID );
		const legacyKey = manager.createCacheKey( tag );

		manager.addCacheRequest( tag );

		ajaxAddRequest.mockImplementation( ( action, options ) => {
			options.success( { [ legacyKey ]: 'legacy-value' } );
		} );

		// Act.
		manager.loadCacheRequestsImmediate();

		// Assert.
		expect( ajaxAddRequest ).toHaveBeenCalledWith(
			'render_tags',
			expect.objectContaining( {
				data: {
					post_id: DOCUMENT_POST_ID,
					tags: [ legacyKey ],
				},
			} ),
		);
		expect( manager.cache[ legacyKey ] ).toBe( 'legacy-value' );
		expect( manager.batchCache ).toEqual( {} );
	} );

	it( 'loadBatchCacheRequests sends a single render_tags_batch request with grouped tags and writes to batchCache', () => {
		// Arrange.
		const tagOne = createTagStub( 1 );
		const tagTwo = createTagStub( 2 );
		const batchKeyOne = manager.createBatchCacheKey( tagOne );
		const batchKeyTwo = manager.createBatchCacheKey( tagTwo );

		manager.addCacheRequest( tagOne );
		manager.addCacheRequest( tagTwo );

		ajaxAddRequest.mockImplementation( ( action, options ) => {
			options.success( {
				[ batchKeyOne ]: 'value-one',
				[ batchKeyTwo ]: 'value-two',
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
		expect( manager.batchCache[ batchKeyOne ] ).toBe( 'value-one' );
		expect( manager.batchCache[ batchKeyTwo ] ).toBe( 'value-two' );
		expect( manager.cache ).toEqual( {} );
	} );

	it( 'loadTagDataFromCache reads batchCache for alternate post context', () => {
		// Arrange.
		const tag = createTagStub( 7 );
		const batchKey = manager.createBatchCacheKey( tag );
		manager.batchCache[ batchKey ] = 'batch-value';
		manager.cache[ batchKey ] = 'legacy-value';

		// Act.
		const result = manager.loadTagDataFromCache( tag );

		// Assert.
		expect( result ).toBe( 'batch-value' );
	} );

	it( 'loadTagDataFromCache reads legacy cache for document post context', () => {
		// Arrange.
		const tag = createTagStub( DOCUMENT_POST_ID );
		const legacyKey = manager.createCacheKey( tag );
		manager.cache[ legacyKey ] = 'legacy-value';

		// Act.
		const result = manager.loadTagDataFromCache( tag );

		// Assert.
		expect( result ).toBe( 'legacy-value' );
	} );

	it( 'prefetchTags resolves after batch request succeeds and writes to batchCache only', async () => {
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

	it( 'cleanCache empties both legacy cache and batchCache', () => {
		// Arrange.
		manager.cache[ 'legacy-key' ] = 'legacy-value';
		manager.batchCache[ 'batch-key' ] = 'batch-value';

		// Act.
		manager.cleanCache();

		// Assert.
		expect( manager.cache ).toEqual( {} );
		expect( manager.batchCache ).toEqual( {} );
	} );
} );
