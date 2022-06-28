import * as readers from './files/readers';
import * as parsers from './files/parsers';

/**
 * Recursively convert objects to arrays of values.
 *
 * @param {*} object
 * @return {[]} values
 */
const recursiveValues = ( object ) => {
	return Object.values( object )
		.map( ( value ) => {
			return 'object' === typeof value
				? Object.values( value )
				: value;
		} );
};

export default {
	readers: recursiveValues( readers ),
	parsers: recursiveValues( parsers ).flat(),
};
