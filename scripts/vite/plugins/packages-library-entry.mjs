export const LIBRARY_ENTRY_ID = '\0elementor-package-library-entry';

/**
 * Publishes the package on `window.elementorV2` the way `ExternalizeWordPressAssetsWebpackPlugin`
 * did through Webpack's `window` library type, which emitted
 * `(window.elementorV2 = window.elementorV2 || {}).editorPanels = __webpack_exports__;`.
 *
 * Rolldown's IIFE format cannot express this on its own: given a dotted `output.name` it emits the
 * namespace guard but never assigns the entry's exports to the leaf, leaving the library
 * undefined. Wrapping the real entry in a module that performs the assignment itself keeps the
 * contract explicit and removes the need for an output name at all.
 */
export function packagesLibraryEntryPlugin( { entryPath, globalName } ) {
	return {
		name: 'elementor-packages-library-entry',
		resolveId( source ) {
			return source === LIBRARY_ENTRY_ID ? LIBRARY_ENTRY_ID : null;
		},
		load( id ) {
			if ( id !== LIBRARY_ENTRY_ID ) {
				return null;
			}

			return [
				`import * as library from ${ JSON.stringify( entryPath ) };`,
				'',
				`(window.elementorV2 = window.elementorV2 || {}).${ globalName } = library;`,
			].join( '\n' );
		},
	};
}
