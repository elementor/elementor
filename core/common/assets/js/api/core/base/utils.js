/**
 * The file contains methods that are utils or helpers that are not exported to `$e`.
 * The methods are only for API CORE internal usage.
 */

/**
 * @param {String|ComponentBase} component
 * @returns {ComponentBase}
 */
export function ensureComponent( component ) {
	if ( 'string' === typeof component ) {
		const assumedNamespace = component;
		component = $e.components.get( component );

		if ( ! component ) {
			throw new Error( `'${ assumedNamespace }' component is not exist.` );
		}
	}

	return component;
}

/**
 * @param {String|ComponentBase} component
 * @returns {string}
 */
export function ensureComponentNamespace( component ) {
	if ( 'string' === typeof component ) {
		return component;
	}

	return component.getNamespace();
}
