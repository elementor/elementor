/**
 * A util function to transform data throw transform functions
 *
 * @param functions
 * @returns {function(*=, ...[*]): *}
 */
export function pipe( ...functions ) {
	return ( value, ...args ) =>
		functions.reduce(
			( currentValue, currentFunction ) => currentFunction( currentValue, ...args ),
			value
		);
}
