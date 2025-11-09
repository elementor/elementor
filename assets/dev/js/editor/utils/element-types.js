/**
 * Returns an array of all available element types.
 *
 * @return {string[]} Array of element type strings.
 */
const getAllElementTypes = () => {
	return Object.keys( elementor.getConfig().elements );
};

module.exports = {
	getAllElementTypes,
};
