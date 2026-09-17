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
