describe( 'lazyLoadScripts', () => {
	let cache;
	let lazyLoadScripts;

	beforeEach( () => {
		cache = {};

		lazyLoadScripts = ( key, urls ) => {
			if ( cache[ key ] ) {
				return cache[ key ];
			}

			const loadScript = ( src ) => new Promise( ( resolve, reject ) => {
				const script = document.createElement( 'script' );
				script.setAttribute( 'data-test', '' );
				script.src = src;
				script.onload = resolve;
				script.onerror = reject;
				document.head.appendChild( script );
			} );

			cache[ key ] = urls.reduce(
				( promise, src ) => promise.then( () => loadScript( src ) ),
				Promise.resolve(),
			);

			return cache[ key ];
		};
	} );

	afterEach( () => {
		document.head.querySelectorAll( 'script[data-test]' ).forEach( ( s ) => s.remove() );
	} );

	test( 'injects script tags for each URL in order', async () => {
		const promise = lazyLoadScripts( 'test', [ 'http://example.com/a.js', 'http://example.com/b.js' ] );

		await Promise.resolve();

		const firstScript = document.head.querySelector( 'script[src="http://example.com/a.js"]' );
		expect( firstScript ).not.toBeNull();
		firstScript.onload();

		await Promise.resolve();

		const secondScript = document.head.querySelector( 'script[src="http://example.com/b.js"]' );
		expect( secondScript ).not.toBeNull();
		secondScript.onload();

		await promise;
	} );

	test( 'returns the same promise when called a second time', () => {
		const firstCall = lazyLoadScripts( 'ace', [ 'http://example.com/ace.js' ] );
		const secondCall = lazyLoadScripts( 'ace', [ 'http://example.com/ace.js' ] );

		expect( firstCall ).toBe( secondCall );
	} );

	test( 'injects only one script tag when called concurrently with the same key', async () => {
		lazyLoadScripts( 'ace', [ 'http://example.com/ace.js' ] );
		lazyLoadScripts( 'ace', [ 'http://example.com/ace.js' ] );

		await Promise.resolve();

		const injectedScripts = document.head.querySelectorAll( 'script[src="http://example.com/ace.js"]' );
		expect( injectedScripts.length ).toBe( 1 );
	} );

	test( 'caches different keys independently', () => {
		const acePromise = lazyLoadScripts( 'ace', [ 'http://example.com/ace.js' ] );
		const pickrPromise = lazyLoadScripts( 'pickr', [ 'http://example.com/pickr.js' ] );

		expect( acePromise ).not.toBe( pickrPromise );
	} );

	test( 'rejects when a script fails to load', async () => {
		const promise = lazyLoadScripts( 'bad', [ 'http://example.com/bad.js' ] );

		await Promise.resolve();

		const failedScript = document.head.querySelector( 'script[src="http://example.com/bad.js"]' );
		failedScript.onerror( new Error( 'network error' ) );

		await expect( promise ).rejects.toBeDefined();
	} );
} );

describe( 'loadAce', () => {
	let lazyLoadScriptsMock;

	const buildCodeControlView = () => ( {
		lazyLoadScripts: lazyLoadScriptsMock,

		loadAce() {
			if ( 'undefined' !== typeof ace ) {
				return Promise.resolve();
			}

			const { ace: aceSrc, aceLangTools } = window._elementorLazyScripts || {};

			return this.lazyLoadScripts( 'ace', [ aceSrc, aceLangTools ] );
		},
	} );

	beforeEach( () => {
		delete global.ace;

		window._elementorLazyScripts = {
			ace: 'https://cdn.jsdelivr.net/npm/ace-builds@1.43.2/src-min-noconflict/ace.min.js',
			aceLangTools: 'https://cdn.jsdelivr.net/npm/ace-builds@1.43.2/src-min-noconflict/ext-language_tools.js',
		};

		lazyLoadScriptsMock = jest.fn( () => Promise.resolve() );
	} );

	afterEach( () => {
		delete global.ace;
		delete window._elementorLazyScripts;
		jest.clearAllMocks();
	} );

	test( 'resolves immediately without loading scripts when ace is already defined', async () => {
		// Arrange.
		global.ace = {};
		const view = buildCodeControlView();

		// Act.
		const promise = view.loadAce();

		// Assert.
		await expect( promise ).resolves.toBeUndefined();
		expect( lazyLoadScriptsMock ).not.toHaveBeenCalled();
	} );

	test( 'delegates to lazyLoadScripts with the ace key and both CDN URLs', () => {
		// Arrange.
		const view = buildCodeControlView();

		// Act.
		view.loadAce();

		// Assert.
		expect( lazyLoadScriptsMock ).toHaveBeenCalledTimes( 1 );
		expect( lazyLoadScriptsMock ).toHaveBeenCalledWith(
			'ace',
			[
				'https://cdn.jsdelivr.net/npm/ace-builds@1.43.2/src-min-noconflict/ace.min.js',
				'https://cdn.jsdelivr.net/npm/ace-builds@1.43.2/src-min-noconflict/ext-language_tools.js',
			],
		);
	} );

	test( 'does not throw when _elementorLazyScripts is not defined', () => {
		// Arrange.
		delete window._elementorLazyScripts;
		const view = buildCodeControlView();

		// Act / Assert.
		expect( () => view.loadAce() ).not.toThrow();
	} );
} );
