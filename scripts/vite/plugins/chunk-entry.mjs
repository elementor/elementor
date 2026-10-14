export const CHUNK_ENTRY_ID = '\0elementor-chunk-entry';

/**
 * Publishes a chunk's exports on `window.__elementorChunks[name]` so `utils/chunk-loader.js` can
 * hand them to callers of `loadChunk( name )`.
 *
 * IIFE format has no `export` mechanism, so the assignment is written explicitly by wrapping the
 * real chunk source in a virtual entry module. Rolldown emits the assignment inline in the same
 * bundle and the loader picks it up as soon as the appended script tag fires `onload`.
 */
export function chunkEntryPlugin( { entryPath, chunkName } ) {
	return {
		name: 'elementor-chunk-entry',
		resolveId( source ) {
			return source === CHUNK_ENTRY_ID ? CHUNK_ENTRY_ID : null;
		},
		load( id ) {
			if ( id !== CHUNK_ENTRY_ID ) {
				return null;
			}

			// Callers destructure the loaded module as `.then( ( { default: Foo } ) => ... )`, so
			// the entire namespace is registered rather than collapsing to `default`. Any consumer
			// that already used `chunk.default` continues to work.
			return [
				`import * as chunk from ${ JSON.stringify( entryPath ) };`,
				'',
				'(window.__elementorChunks = window.__elementorChunks || {})' +
					`[ ${ JSON.stringify( chunkName ) } ] = chunk;`,
			].join( '\n' );
		},
	};
}
