/**
 * On-demand loader for frontend code chunks.
 *
 * Rolldown's IIFE output cannot code split, so every dynamic `import()` would otherwise be inlined
 * into the entry. That regressed `frontend.min.js` from 10.4 KiB gzip to 53.7 KiB, most of it
 * unused on any given page. The build rewrites those imports at build time to `loadChunk(name)`
 * so the entry stays small and each handler ships as its own bundle fetched only when a widget
 * needs it.
 *
 * A chunk bundle is an IIFE that assigns its default export to `window.__elementorChunks[name]`.
 * The `__ELEMENTOR_CHUNK_SUFFIX__` constant is replaced at build time with `.min` for the
 * production build and the empty string otherwise, so a dev frontend loads dev chunks and a prod
 * frontend loads minified ones.
 */

/* global __ELEMENTOR_CHUNK_SUFFIX__ */

function chunkUrl( name ) {
	const config = window.elementorFrontendConfig || {};
	const assetsUrl = config.urls?.assets || '';
	const version = config.version ? '?ver=' + encodeURIComponent( config.version ) : '';

	return assetsUrl + 'js/chunks/' + name + __ELEMENTOR_CHUNK_SUFFIX__ + '.js' + version;
}

const registry = window.__elementorChunks = window.__elementorChunks || {};
const inflight = new Map();

function appendChunkScript( name ) {
	return new Promise( ( resolve, reject ) => {
		const script = document.createElement( 'script' );

		script.src = chunkUrl( name );
		script.async = true;
		script.onload = () => {
			if ( registry[ name ] ) {
				resolve( registry[ name ] );
			} else {
				reject( new Error( `[elementor] chunk "${ name }" loaded but did not register` ) );
			}
		};
		script.onerror = () => reject( new Error( `[elementor] failed to load chunk "${ name }" from ${ script.src }` ) );
		document.head.appendChild( script );
	} );
}

/**
 * Returns a promise for the module namespace of a chunk, appending its script tag on first
 * request. The build rewrites `import( './handlers/video' )` in frontend sources to
 * `loadChunk( 'video' )`, so call sites see the same then-able interface they wrote against.
 *
 * @param {string} name
 */
export function loadChunk( name ) {
	if ( registry[ name ] ) {
		return Promise.resolve( registry[ name ] );
	}

	if ( ! inflight.has( name ) ) {
		inflight.set( name, appendChunkScript( name ) );
	}

	return inflight.get( name );
}

window.__elementorLoadChunk = loadChunk;
