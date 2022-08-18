export default class Arr {
	/**
	 * Inspired by Laravel's `Illuminate\Collections\Arr::join()`
	 *
	 * @see https://github.com/illuminate/collections/blob/43bb6df12c4b69e3c07ce745b868ab4b74579c96/Arr.php#L429-L454
	 *
	 * @param {string[]} array
	 * @param {string}   glue
	 * @param {string}   finalGlue
	 *
	 * @return {string}
	 */
	static join( array, glue, finalGlue = '' ) {
		if ( '' === finalGlue ) {
			return array.join( glue );
		}

		if ( ! array.length ) {
			return '';
		}

		if ( 1 === array.length ) {
			return array[ 0 ];
		}

		const clone = [ ...array ],
			lastItem = clone.pop();

		return clone.join( glue ) + finalGlue + lastItem;
	}
}
