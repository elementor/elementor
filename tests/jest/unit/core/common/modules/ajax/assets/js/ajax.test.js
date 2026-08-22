const jQuery = require( './mock/jquery' );

const BATCH_DEBOUNCE = 500;

describe( 'Ajax batch requests', () => {
	let ajax, sentRequests;

	const settleDeferred = ( deferred ) => {
		const state = { status: 'pending' };

		deferred
			.done( ( data ) => Object.assign( state, { status: 'resolved', data } ) )
			.fail( ( data ) => Object.assign( state, { status: 'rejected', data } ) );

		return state;
	};

	const flushBatch = () => jest.advanceTimersByTime( BATCH_DEBOUNCE );

	const respondToLastRequest = ( responses ) =>
		sentRequests[ sentRequests.length - 1 ].success( { success: true, data: { responses } } );

	const getActionsOfLastRequest = () => JSON.parse( sentRequests[ sentRequests.length - 1 ].data.actions );

	beforeEach( () => {
		jest.resetModules();
		jest.useFakeTimers();

		sentRequests = [];

		global.jQuery = jQuery;
		global._ = {
			has: ( object, key ) => Object.prototype.hasOwnProperty.call( object, key ),
			debounce: ( callback, wait ) => {
				let timer;

				return ( ...args ) => {
					clearTimeout( timer );

					timer = setTimeout( () => callback( ...args ), wait );
				};
			},
		};
		global.elementorModules = {
			Module: require( 'elementor-assets-js/modules/imports/module' ),
		};
		global.elementorCommon = {
			config: {
				ajax: {
					url: 'https://example.com/wp-admin/admin-ajax.php',
				},
			},
			helpers: {
				cloneObject: ( object ) => JSON.parse( JSON.stringify( object ) ),
			},
		};

		jest.spyOn( jQuery, 'ajax' ).mockImplementation( ( options ) => {
			sentRequests.push( options );

			return { abort: jest.fn() };
		} );

		const Ajax = require( 'elementor-common-modules/ajax/assets/js/ajax' ).default;

		ajax = new Ajax( { nonce: 'nonce' } );
	} );

	afterEach( () => {
		jest.useRealTimers();

		delete global.jQuery;
		delete global._;
		delete global.elementorCommon;
	} );

	it( 'should settle both callers when identical requests share a batch entry', () => {
		// Arrange
		const request = { action: 'get_document_config', unique_id: 'document-1', data: { id: 1 } };

		// Act
		const first = settleDeferred( ajax.load( { ...request } ) );
		const second = settleDeferred( ajax.load( { ...request } ) );

		flushBatch();

		respondToLastRequest( { 'document-1': { success: true, data: { id: 1 } } } );

		// Assert
		expect( sentRequests ).toHaveLength( 1 );
		expect( getActionsOfLastRequest() ).toEqual( {
			'document-1': { action: 'get_document_config', data: { id: 1 } },
		} );
		expect( first ).toEqual( { status: 'resolved', data: { id: 1 } } );
		expect( second ).toEqual( { status: 'resolved', data: { id: 1 } } );
	} );

	it( 'should reject both callers when a shared batch entry fails', () => {
		// Arrange
		const request = { action: 'get_document_config', unique_id: 'document-1', data: { id: 1 } };

		// Act
		const first = settleDeferred( ajax.load( { ...request } ) );
		const second = settleDeferred( ajax.load( { ...request } ) );

		flushBatch();

		respondToLastRequest( { 'document-1': { success: false, data: 'Not found' } } );

		// Assert
		expect( first ).toEqual( { status: 'rejected', data: 'Not found' } );
		expect( second ).toEqual( { status: 'rejected', data: 'Not found' } );
	} );

	it( 'should reject a displaced request when the same unique id is reused with different data', () => {
		// Arrange
		const displaced = settleDeferred(
			ajax.load( { action: 'search', unique_id: 'search', data: { term: 'butto' } } ),
		);

		// Act
		const latest = settleDeferred(
			ajax.load( { action: 'search', unique_id: 'search', data: { term: 'button' } } ),
		);

		flushBatch();

		respondToLastRequest( { search: { success: true, data: [ 'button' ] } } );

		// Assert
		expect( sentRequests ).toHaveLength( 1 );
		expect( getActionsOfLastRequest() ).toEqual( { search: { action: 'search', data: { term: 'button' } } } );
		expect( displaced ).toEqual( { status: 'rejected', data: 'Request replaced' } );
		expect( latest ).toEqual( { status: 'resolved', data: [ 'button' ] } );
	} );

	it( 'should serve a repeated request from the cache without sending it again', () => {
		// Arrange
		const request = { action: 'get_document_config', unique_id: 'document-1', data: { id: 1 } };

		settleDeferred( ajax.load( { ...request } ) );

		flushBatch();

		respondToLastRequest( { 'document-1': { success: true, data: { id: 1 } } } );

		// Act
		const cached = settleDeferred( ajax.load( { ...request } ) );

		flushBatch();

		// Assert
		expect( sentRequests ).toHaveLength( 1 );
		expect( cached ).toEqual( { status: 'resolved', data: { id: 1 } } );
	} );
} );

describe( 'Ajax HTTP 429 retry', () => {
	let ajax, sentRequests, sentXhrs;

	const settleDeferred = ( deferred ) => {
		const state = { status: 'pending' };

		deferred
			.done( ( data ) => Object.assign( state, { status: 'resolved', data } ) )
			.fail( ( data ) => Object.assign( state, { status: 'rejected', data } ) );

		return state;
	};

	const flushBatch = () => jest.advanceTimersByTime( BATCH_DEBOUNCE );

	const respondToLastRequest = ( responses ) =>
		sentRequests[ sentRequests.length - 1 ].success( { success: true, data: { responses } } );

	// Invokes the jQuery error callback with a fake jqXHR carrying the given status and,
	// optionally, a Retry-After header.
	const failSendingRequest = ( status, retryAfter ) => {
		const jqXHR = {
			status,
			getResponseHeader: ( header ) => ( 'Retry-After' === header ? retryAfter : null ),
		};

		sentRequests[ sentRequests.length - 1 ].error( jqXHR, 'error', status );
	};

	beforeEach( () => {
		jest.resetModules();
		jest.useFakeTimers();

		sentRequests = [];
		sentXhrs = [];

		global.jQuery = jQuery;
		global._ = {
			has: ( object, key ) => Object.prototype.hasOwnProperty.call( object, key ),
			debounce: ( callback, wait ) => {
				let timer;

				return ( ...args ) => {
					clearTimeout( timer );

					timer = setTimeout( () => callback( ...args ), wait );
				};
			},
		};
		global.elementorModules = {
			Module: require( 'elementor-assets-js/modules/imports/module' ),
		};
		global.elementorCommon = {
			config: {
				ajax: {
					url: 'https://example.com/wp-admin/admin-ajax.php',
				},
			},
			helpers: {
				cloneObject: ( object ) => JSON.parse( JSON.stringify( object ) ),
			},
		};

		jest.spyOn( jQuery, 'ajax' ).mockImplementation( ( options ) => {
			sentRequests.push( options );

			const xhr = { abort: jest.fn() };

			sentXhrs.push( xhr );

			return xhr;
		} );

		const Ajax = require( 'elementor-common-modules/ajax/assets/js/ajax' ).default;

		ajax = new Ajax( { nonce: 'nonce' } );
	} );

	afterEach( () => {
		jest.useRealTimers();

		delete global.jQuery;
		delete global._;
		delete global.elementorCommon;
	} );

	const triggerBatchedLoad = () => {
		const request = { action: 'get_document_config', unique_id: 'document-1', data: { id: 1 } };

		const first = settleDeferred( ajax.load( { ...request } ) );
		const second = settleDeferred( ajax.load( { ...request } ) );

		return { first, second };
	};

	it( 'should retry a 429 without a Retry-After header using exponential backoff', () => {
		// Arrange
		const { first, second } = triggerBatchedLoad();

		flushBatch();

		// Act: first attempt returns 429 with no Retry-After.
		failSendingRequest( 429, null );

		// The first retry runs after 1000ms; it succeeds.
		jest.advanceTimersByTime( 1000 );
		respondToLastRequest( { 'document-1': { success: true, data: { id: 1 } } } );

		// Assert
		expect( sentRequests ).toHaveLength( 2 );
		expect( first ).toEqual( { status: 'resolved', data: { id: 1 } } );
		expect( second ).toEqual( { status: 'resolved', data: { id: 1 } } );
	} );

	it( 'should wait for the Retry-After delay in seconds before retrying', () => {
		// Arrange
		const { first, second } = triggerBatchedLoad();

		flushBatch();

		// Act: first attempt returns 429 telling us to wait 2s.
		failSendingRequest( 429, '2' );

		// The retry must not have fired before the header delay elapses.
		jest.advanceTimersByTime( 1000 );
		expect( sentRequests ).toHaveLength( 1 );

		// After the 2s delay the retry fires and succeeds.
		jest.advanceTimersByTime( 1000 );
		respondToLastRequest( { 'document-1': { success: true, data: { id: 1 } } } );

		// Assert
		expect( sentRequests ).toHaveLength( 2 );
		expect( first ).toEqual( { status: 'resolved', data: { id: 1 } } );
		expect( second ).toEqual( { status: 'resolved', data: { id: 1 } } );
	} );

	it( 'should wait for a Retry-After HTTP-date before retrying', () => {
		// Arrange
		const { first, second } = triggerBatchedLoad();

		flushBatch();

		const retryAt = new Date( Date.now() + 2000 ).toUTCString();

		// Act: first attempt returns 429 with an HTTP-date Retry-After 2s from now.
		failSendingRequest( 429, retryAt );

		jest.advanceTimersByTime( 1000 );
		expect( sentRequests ).toHaveLength( 1 );

		jest.advanceTimersByTime( 1000 );
		respondToLastRequest( { 'document-1': { success: true, data: { id: 1 } } } );

		// Assert
		expect( sentRequests ).toHaveLength( 2 );
		expect( first ).toEqual( { status: 'resolved', data: { id: 1 } } );
		expect( second ).toEqual( { status: 'resolved', data: { id: 1 } } );
	} );

	it( 'should reject callers and make no further attempt after exhausting retries', () => {
		// Arrange
		const { first, second } = triggerBatchedLoad();

		// Act: every attempt returns 429 with a 1s Retry-After, four times in a row.
		for ( let attempt = 0; attempt <= 3; attempt += 1 ) {
			if ( 0 === attempt ) {
				flushBatch();
			} else {
				jest.advanceTimersByTime( 1000 );
			}

			failSendingRequest( 429, '1' );
		}

		jest.advanceTimersByTime( 4000 );

		// Assert: initial send plus three retries, then both callers reject.
		expect( sentRequests ).toHaveLength( 4 );
		expect( first.status ).toBe( 'rejected' );
		expect( second.status ).toBe( 'rejected' );
	} );

	it( 'should not retry a 500 response', () => {
		// Arrange
		const { first, second } = triggerBatchedLoad();

		flushBatch();

		// Act
		failSendingRequest( 500 );

		jest.advanceTimersByTime( 4000 );

		// Assert: a single attempt, and the callers are rejected.
		expect( sentRequests ).toHaveLength( 1 );
		expect( first.status ).toBe( 'rejected' );
		expect( second.status ).toBe( 'rejected' );
	} );

	it( 'should not send another request after abort during the retry wait', () => {
		// Arrange: immediately:true stores the abortable wrapper on the deferred.
		const request = { action: 'get_document_config', unique_id: 'document-1', data: { id: 1 } };
		const deferred = ajax.load( { ...request }, true );
		const first = settleDeferred( deferred );

		// Act: 429 schedules a 2s retry, then the caller cancels during that wait.
		failSendingRequest( 429, '2' );

		deferred.jqXhr.abort( 'Request canceled' );

		jest.advanceTimersByTime( 2000 );

		// Assert
		expect( sentRequests ).toHaveLength( 1 );
		expect( first.status ).toBe( 'rejected' );
	} );

	it( 'should resolve both callers when a retry succeeds after repeated 429s', () => {
		// Arrange
		const { first, second } = triggerBatchedLoad();

		flushBatch();

		// Act: two 429s, then a successful response.
		failSendingRequest( 429 );
		jest.advanceTimersByTime( 1000 );
		failSendingRequest( 429 );
		jest.advanceTimersByTime( 2000 );
		respondToLastRequest( { 'document-1': { success: true, data: { id: 1 } } } );

		// Assert
		expect( sentRequests ).toHaveLength( 3 );
		expect( first ).toEqual( { status: 'resolved', data: { id: 1 } } );
		expect( second ).toEqual( { status: 'resolved', data: { id: 1 } } );
	} );

	it( 'should fall back to exponential backoff when Retry-After is unparsable', () => {
		// Arrange
		const { first, second } = triggerBatchedLoad();

		flushBatch();

		// Act: "not-a-date" is neither digits nor an HTTP-date, so backoff (1000ms) applies.
		failSendingRequest( 429, 'not-a-date' );

		jest.advanceTimersByTime( 999 );
		expect( sentRequests ).toHaveLength( 1 );

		jest.advanceTimersByTime( 1 );
		respondToLastRequest( { 'document-1': { success: true, data: { id: 1 } } } );

		// Assert
		expect( sentRequests ).toHaveLength( 2 );
		expect( first ).toEqual( { status: 'resolved', data: { id: 1 } } );
		expect( second ).toEqual( { status: 'resolved', data: { id: 1 } } );
	} );

	it( 'should cap a large Retry-After delay at 30 seconds', () => {
		// Arrange
		const { first, second } = triggerBatchedLoad();

		flushBatch();

		// Act: header asks for 120s; the wait is capped at RETRY_MAX_DELAY_MS (30s).
		failSendingRequest( 429, '120' );

		jest.advanceTimersByTime( 30000 );

		respondToLastRequest( { 'document-1': { success: true, data: { id: 1 } } } );

		// Assert
		expect( sentRequests ).toHaveLength( 2 );
		expect( first ).toEqual( { status: 'resolved', data: { id: 1 } } );
		expect( second ).toEqual( { status: 'resolved', data: { id: 1 } } );
	} );

	it( 'should abort a request that is in flight when abort is called', () => {
		// Arrange: immediately:true stores the wrapper on the deferred.
		const request = { action: 'get_document_config', unique_id: 'document-1', data: { id: 1 } };
		const deferred = ajax.load( { ...request }, true );

		settleDeferred( deferred );

		// Act: cancel while the first attempt is still in flight.
		deferred.jqXhr.abort( 'Request canceled' );

		// Assert
		expect( sentXhrs[ 0 ].abort ).toHaveBeenCalledWith( 'Request canceled' );
	} );

	it( 'should ignore abort after the request has settled', () => {
		// Arrange: immediately:true stores the wrapper on the deferred.
		const request = { action: 'get_document_config', unique_id: 'document-1', data: { id: 1 } };
		const deferred = ajax.load( { ...request }, true );
		const first = settleDeferred( deferred );

		respondToLastRequest( { 'document-1': { success: true, data: { id: 1 } } } );

		// Act: a late abort (e.g. from a stale handle) must not re-settle anything.
		expect( () => deferred.jqXhr.abort() ).not.toThrow();

		// Assert
		expect( sentRequests ).toHaveLength( 1 );
		expect( first ).toEqual( { status: 'resolved', data: { id: 1 } } );
	} );
} );
