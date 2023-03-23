export default function parseSizeUnitsSelectorsDictionary( string, obj ) {
	return string.replace( /{{(.*?)}}/g, function( match, placeholder ) {
		const keys = placeholder.toLowerCase().split( '.' );
		let value = obj;

		for ( let i = 0; i < keys.length; i++ ) {
			value = value[ keys[ i ] ];

			if ( value === undefined ) {
				return match;
			}
		}

		return value;
	} );
}
