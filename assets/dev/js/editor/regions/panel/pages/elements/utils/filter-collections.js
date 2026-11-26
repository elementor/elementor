const isValidCollection = ( collection ) =>
	Array.isArray( collection?.models ) && 'function' === typeof collection.each;

const isValidCollections = ( collections ) =>
	isValidCollection( collections?.elementsCollection ) && isValidCollection( collections?.categoriesCollection );

/**
 * Lets extensions replace the panel collections via the `panel/elements/collections` filter.
 * Falls back to the given collections when a handler throws or returns an invalid shape.
 * Handlers run as one chain, so a single failing handler discards the output of all of them.
 *
 * @param {{ elementsCollection: Object, categoriesCollection: Object }} collections The freshly built Backbone collections.
 * @return {{ elementsCollection: Object, categoriesCollection: Object }} The filtered collections.
 */
export function filterCollections( collections ) {
	try {
		const filtered = elementor.hooks.applyFilters( 'panel/elements/collections', collections );

		return isValidCollections( filtered ) ? filtered : collections;
	} catch ( error ) {
		console.error( 'Failed to filter the panel elements collections.', error?.message ); // eslint-disable-line no-console

		return collections;
	}
}
