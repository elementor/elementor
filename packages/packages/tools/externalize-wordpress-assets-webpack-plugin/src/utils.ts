import { type RequestToGlobalMap } from './types';

export function transformRequestToGlobal( request: string | undefined, map: RequestToGlobalMap ) {
	if ( ! request ) {
		return null;
	}

	for ( const item of map ) {
		let { request: requestRegex, global } = item;

		if ( ! ( requestRegex instanceof RegExp ) ) {
			requestRegex = new RegExp( `^${ requestRegex }$` );
		}

		const matches = request.match( requestRegex );

		if ( matches ) {
			return replaceGlobal( global, matches );
		}
	}

	return null;
}

function replaceGlobal( global: string | string[], matches: RegExpMatchArray ) {
	let result = typeof global === 'string' ? [ global ] : [ ...global ];

	matches.forEach( ( value, index ) => {
		// Replace regex backreferences with capture groups.
		// The user can set ['something', '$1', 'a', '$2'] in the global, and the backreferences will
		// be replaced by the matched groups in the regex.
		result = result.map( ( item ) => item.replace( `$${ index }`, kebabToCamelCase( value ) ) );
	} );

	return result;
}

export function kebabToCamelCase( kebabCase: string ) {
	return kebabCase.replace( /-(\w)/g, ( _, w: string ) => w.toUpperCase() );
}
