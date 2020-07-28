export default class Utils {
	static pxToRem = ( pixels ) => {
		if ( ! pixels ) {
			return;
		}

		return `${ pixels * 0.0625 }rem`;
	}

	static arrayToClassName = ( array ) => {
		return array.filter( ( classItem ) => '' !== classItem ).join( ' ' );
	}
}
