import * as readers from './files/readers';
import * as parsers from './files/parsers';

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
