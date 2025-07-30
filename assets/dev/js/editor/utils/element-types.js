const ELEMENT_TYPES = {
	SECTION: 'section',
	CONTAINER: 'container',
	DIV_BLOCK: 'e-div-block',
	FLEXBOX: 'e-flexbox',
};

/**
 * Returns an array of all available element types.
 *
 * @return {string[]} Array of element type strings.
 */
const getAllElementTypes = () => {
	return Object.keys( elementor.getConfig().elements );
};

module.exports = {
	ELEMENT_TYPES,
	getAllElementTypes,
};
