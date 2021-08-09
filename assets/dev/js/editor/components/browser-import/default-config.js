import * as readers from './files/readers';
import * as parsers from './files/parsers';

/**
 * Create a config object by recursively iterating over the imported objects. When it's a class with a `getName` method,
 * use it as the object's name. Otherwise, use the key provided by the import (either a directory name or object name)
 * as lower case characters.
 * The `index.js` file should export all objects of the directory. When a higher level of nesting needed, the file can
 * export directories and their content as long as a key for the directory is provided. For example, when we want to
 * export a directory of `image` parsers, we can use the export syntax like this: `export * as image from './image';`.
 *
 * @param object
 * @returns {{}}
 */
const prepareConfig = ( object ) => {
	const result = {};

	for ( const [ key, value ] of Object.entries( object ) ) {
		result[ value.getName?.() || key.toLowerCase() ] = 'object' === typeof value ?
			prepareConfig( value ) :
			value;
	}

	return result;
};

export default {
	readers: prepareConfig( readers ),
	parsers: prepareConfig( parsers ),
};
