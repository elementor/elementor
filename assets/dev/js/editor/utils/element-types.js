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
	return Object.values( ELEMENT_TYPES );
};

module.exports = {
	ELEMENT_TYPES,
	getAllElementTypes,
};
