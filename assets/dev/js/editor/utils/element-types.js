/**
 * Returns an array of all available element types.
 *
 * @return {string[]} Array of element type strings.
 */
const getAllElementTypes = () => {
	return Object.keys( elementor.getConfig().elements );
};

/**
 * Compound atomic element types that should be auto-wrapped in a flexbox container
 * when dropped onto the canvas, consistent with atom elements (Heading, Image, etc.).
 *
 * @type {string[]}
 */
const COMPOUND_ATOMIC_TYPES = [ 'e-tabs', 'e-accordion', 'e-collection-loop' ];

module.exports = {
	getAllElementTypes,
	COMPOUND_ATOMIC_TYPES,
};
