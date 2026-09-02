/**
 * Returns an array of all available element types.
 *
 * @return {string[]} Array of element type strings.
 */
const getAllElementTypes = () => {
	return Object.keys( elementor.getConfig().elements );
};

/**
 * Returns whether an element type is a compound atomic element —
 * one that should be auto-wrapped in a flexbox container when dropped on the canvas,
 * consistent with atom elements (Heading, Image, etc.).
 *
 * Compound atomic elements declare `is_compound: true` in their PHP element meta.
 *
 * @param {string} elType - The element type string (e.g. 'e-tabs').
 * @return {boolean}
 */
const isCompoundAtomicType = ( elType ) => {
	return !! elementor.getConfig().elements[ elType ]?.is_compound;
};

module.exports = {
	getAllElementTypes,
	isCompoundAtomicType,
};
