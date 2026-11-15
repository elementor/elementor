( function() {
	const OUTER_ROOT_ID = 'pocroot';
	const INNER_ROOT_ID = 'pocinnr';
	const CHANGE_EVENT = 'e-state:change';
	const SETTLE_MS = 50;
	const EXPECTED_ENTRIES = 12;
	const PENDING_TEXT = '...';
	const EXPECTED_INIT_EFFECT_RUNS = 2;

	const Alpine = window.elementorV2?.alpinejs?.Alpine;
	const pocLog = window.__eStatePoc;
	const results = [];
	const events = { [ OUTER_ROOT_ID ]: [], [ INNER_ROOT_ID ]: [] };
	const mutationsBeforeInit = [];

	const byId = ( id ) => document.querySelector( `[data-id="${ id }"]` );
	const keyText = ( rootId, key ) => byId( rootId )?.querySelector( `[data-e-state-key="${ key }"]` )?.textContent.trim();
	const settle = () => new Promise( ( resolve ) => setTimeout( resolve, SETTLE_MS ) );
	const payload = JSON.parse( document.getElementById( 'e-state-poc-data' )?.textContent || '{"entries":[]}' );

	function check( name, pass, detail ) {
		results.push( `${ pass ? 'PASS' : 'FAIL' }  ${ name }  ${ JSON.stringify( detail ) }` );
	}

	function report() {
		const output = results.join( '\n' );
		document.getElementById( 'e-state-poc-results' ).textContent = output;
		window.__eStatePoc.results = results;
		console.log( '[e-state-poc]\n' + output ); // eslint-disable-line no-console
	}

	const serverPaint = {
		qty: keyText( OUTER_ROOT_ID, 'qty' ),
		total: keyText( OUTER_ROOT_ID, 'total' ),
		totalPending: byId( OUTER_ROOT_ID )?.querySelector( '[data-e-state-key="total"]' )?.hasAttribute( 'data-e-state-pending' ),
		title: keyText( OUTER_ROOT_ID, 'title' ),
		innerCount: keyText( INNER_ROOT_ID, 'count' ),
		staticMarkerKept: Boolean( byId( 'pocstat' )?.querySelector( '[data-e-state-key]' ) ),
	};

	Object.keys( events ).forEach( ( id ) => {
		byId( id )?.addEventListener( CHANGE_EVENT, ( event ) => events[ id ].push( event.detail ) );
	} );

	let initMutationBatches = 0;

	const initObserver = new MutationObserver( ( records ) => {
		initMutationBatches++;
		records.forEach( ( record ) => mutationsBeforeInit.push( { type: record.type, target: record.target.nodeName, at: performance.now() } ) );
	} );

	initObserver.observe( document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: [ 'class', 'style' ] } );

	document.addEventListener( 'alpine:init', () => {
		initObserver.takeRecords();
		initMutationBatches = 0;
		mutationsBeforeInit.length = 0;
	}, { once: true } );

	function runStaticChecks() {
		const hookLog = payload.hookLog || [];
		const firstChild = hookLog.indexOf( 'before:pocqtyl' );

		check( '1 hooks deliver the state', payload.entries.length === EXPECTED_ENTRIES &&
			hookLog[ 0 ] === `before:${ OUTER_ROOT_ID }` && firstChild > 0 &&
			hookLog[ hookLog.length - 1 ] === `after:${ OUTER_ROOT_ID }`, { entries: payload.entries.length, cacheMode: payload.cacheMode, hookLogLength: hookLog.length } );

		const titleValue = payload.entries.find( ( entry ) => entry.dataId === OUTER_ROOT_ID )?.root.values.title;

		check( '2 server-rendered first paint', '2' === serverPaint.qty && serverPaint.total === PENDING_TEXT &&
			'string' === typeof titleValue && titleValue.length > 0 && serverPaint.title === titleValue, serverPaint );

		const marked = pocLog.log.find( ( item ) => 'marked' === item.type )?.detail;
		const unbound = [ ...document.querySelectorAll( '[data-e-state-scope] [data-e-state-key]:not([x-bind])' ) ].length;

		check( '3 marking before start', marked && marked.entries === marked.marked && 0 === unbound, { marked, unbound } );
		check( '4 element cache (see ?cache=1)', ! payload.cacheMode || payload.entries.length === EXPECTED_ENTRIES, { cacheMode: payload.cacheMode, entries: payload.entries.length } );
		const markerSources = pocLog.log.filter( ( item ) => 'text-marker' === item.type ).map( ( item ) => item.detail.source );

		check( '11 server span marker survives', markerSources.length > 0 && markerSources.every( ( source ) => 'server' === source ), {
			markerSources,
			staticMarkerKept: serverPaint.staticMarkerKept,
			pendingAttributeKept: serverPaint.totalPending,
		} );
	}

	function runInitChecks() {
		const outer = byId( OUTER_ROOT_ID );
		const sizeClasses = [ 's', 'm', 'l' ].map( ( size ) => byId( `pocsz_${ size }` )?.classList.contains( 'is-selected' ) );

		check( '5 Alpine.bind under CSP', '20' === keyText( OUTER_ROOT_ID, 'total' ), { total: keyText( OUTER_ROOT_ID, 'total' ) } );
		check( '6 compute on init in one pass', '20' === keyText( OUTER_ROOT_ID, 'total' ) &&
			'[false,true,false]' === JSON.stringify( sizeClasses ) && '0' === keyText( INNER_ROOT_ID, 'count' ) &&
			'2' === outer.style.getPropertyValue( '--e-state-qty' ), { sizeClasses, qtyVar: outer.style.getPropertyValue( '--e-state-qty' ) } );
		check( '7a x-effect runs once per root at init', pocLog.effectRuns === EXPECTED_INIT_EFFECT_RUNS, { effectRuns: pocLog.effectRuns } );
		check( '9a zero change events at init', 0 === events[ OUTER_ROOT_ID ].length + events[ INNER_ROOT_ID ].length, events );

		const paint = performance.getEntriesByName( 'first-contentful-paint' )[ 0 ];
		const initAt = pocLog.log.find( ( item ) => 'alpine:initialized' === item.type )?.at;

		check( '8 init mutations land in one task (no intermediate paint)', initMutationBatches <= 1, {
			fcp: paint?.startTime,
			alpineInitialized: initAt,
			mutations: mutationsBeforeInit.length,
			batches: initMutationBatches,
		} );
	}

	async function runInteractionChecks() {
		const outer = byId( OUTER_ROOT_ID );
		const outerData = Alpine.$data( outer );
		const effectRunsBefore = pocLog.effectRuns;

		const idleObserverRecords = [];
		const idleObserver = new MutationObserver( ( records ) => idleObserverRecords.push( ...records ) );
		idleObserver.observe( outer, { subtree: true, childList: true, characterData: true, attributes: true } );
		await settle();
		idleObserver.disconnect();
		check( '6b nothing changes without a dispatch', 0 === idleObserverRecords.length, { mutations: idleObserverRecords.length } );

		byId( 'pocplus' ).click();
		await settle();
		const plusEvent = events[ OUTER_ROOT_ID ][ 0 ];
		check( '9b one non-bubbling change event per dispatch', 1 === events[ OUTER_ROOT_ID ].length &&
			'["qty"]' === JSON.stringify( plusEvent?.changed ) && 3 === plusEvent?.state.qty &&
			Array.isArray( plusEvent?.state.sizes ) && '30' === keyText( OUTER_ROOT_ID, 'total' ), { plusEvent, total: keyText( OUTER_ROOT_ID, 'total' ) } );
		check( '7b x-effect re-runs after a dependency changes', pocLog.effectRuns === effectRunsBefore + 1, { effectRuns: pocLog.effectRuns } );

		const effectRunsBeforeSelect = pocLog.effectRuns;
		byId( 'pocsz_s' ).click();
		await settle();
		check( '7c x-effect skips an unrelated key', pocLog.effectRuns === effectRunsBeforeSelect &&
			byId( 'pocsz_s' ).classList.contains( 'is-selected' ) && ! byId( 'pocsz_m' ).classList.contains( 'is-selected' ), { effectRuns: pocLog.effectRuns } );

		const eventsBeforeInvalid = events[ OUTER_ROOT_ID ].length;
		outerData.dispatch( 'invalid' );
		await settle();
		check( '9c invalid patch changes nothing', eventsBeforeInvalid === events[ OUTER_ROOT_ID ].length && 3 === outerData.state.qty, { qty: outerData.state.qty } );

		byId( 'pocmins' ).click();
		await settle();
		check( '10a x-on:click="dispatchFromEl" under CSP', 2 === outerData.state.qty && '2' === keyText( OUTER_ROOT_ID, 'qty' ), { qty: outerData.state.qty } );

		const outerEventsBeforeInner = events[ OUTER_ROOT_ID ].length;
		byId( 'pocincb' ).click();
		await settle();
		check( '10b nested root is isolated', '1' === keyText( INNER_ROOT_ID, 'count' ) && 1 === events[ INNER_ROOT_ID ].length &&
			outerEventsBeforeInner === events[ OUTER_ROOT_ID ].length && 2 === outerData.state.qty, { innerCount: keyText( INNER_ROOT_ID, 'count' ), outerQty: outerData.state.qty } );

		for ( let i = 0; i < 3; i++ ) {
			byId( 'pocplus' ).click();
		}
		await settle();
		check( '7d x-effect drives a root class from a derived key', outer.classList.contains( 'is-max' ) && 5 === outerData.state.qty, { qty: outerData.state.qty } );
	}

	runStaticChecks();

	if ( ! Alpine ) {
		check( 'alpine available', false, 'window.elementorV2.alpinejs.Alpine is missing' );
		report();
		return;
	}

	document.addEventListener( 'alpine:initialized', () => {
		const pendingRecords = initObserver.takeRecords();

		if ( pendingRecords.length ) {
			initMutationBatches++;
			pendingRecords.forEach( ( record ) => mutationsBeforeInit.push( { type: record.type, target: record.target.nodeName, at: performance.now() } ) );
		}

		initObserver.disconnect();
		runInitChecks();
		runInteractionChecks()
			.catch( ( error ) => check( 'interaction checks threw', false, String( error ) ) )
			.finally( report );
	}, { once: true } );
}() );
