/**
 * Some FileAPI objects such as FileList, DataTransferItem and DataTransferItemList has inconsistency with the retrieved
 * object (from events, etc.) and the actual JavaScript object so a regular instanceof doesn't work. This function can
 * check whether it's instanceof by using the objects constructor and prototype names.
 *
 * @param object
 * @param classDeclaration
 * @returns {boolean}
 */

export default ( object, classDeclaration ) => {
	return object.constructor.name === classDeclaration.prototype[ Symbol.toStringTag ];
};
