/**
 * Some FileAPI objects such as FileList, DataTransferItem and DataTransferItemList has inconsistency with the retrieved
 * object (from events, etc.) and the actual JavaScript object so a regular instanceof doesn't work. This function can
 * check whether it's instanceof by using the objects constructor and prototype names.
 *
 * @param  object
 * @param  constructors
 * @return {boolean}
 */

export default ( object, constructors ) => {
	constructors = Array.isArray( constructors ) ? constructors : [ constructors ];

	for ( const constructor of constructors ) {
		if ( object.constructor.name === constructor.prototype[ Symbol.toStringTag ] ) {
			return true;
		}
	}

	return false;
};
