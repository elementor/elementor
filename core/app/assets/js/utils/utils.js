export default class Utils {
	static pxToRem = ( pixels ) => {
		if ( ! pixels ) {
			return;
		}

		return `${ pixels * 0.0625 }rem`;
	};

	static arrayToClassName = ( array ) => {
		return array.filter( ( classItem ) => '' !== classItem ).join( ' ' );
	};

	static stringToRemValues = ( string ) => {
		return string
			.split( ' ' )
			.map( ( value ) => Utils.pxToRem( value ) )
			.join( ' ' );
	};

	static rgbToHex = ( r, g, b)  => '#' + [ r, g, b ].map( ( x ) => {
		const hex = x.toString( 16 );
		return 1 === hex.length ? '0' + hex : hex;
	} ).join( '' );
}
