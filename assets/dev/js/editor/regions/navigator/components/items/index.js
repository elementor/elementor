import { DocumentItem } from './document-item';
import { ElementItem } from './element-item';

export {
	DocumentItem,
	ElementItem,
};

/**
 * Base element DOM class.
 *
 * @var {string}
 */
export const BASE_ITEM_CLASS = 'elementor-navigator__element';

/**
 * List of Item Components for each item type.
 *
 * @type {{}}
 */
export const ITEMS_COMPONENT = {
	document: DocumentItem,
	element: ElementItem,
};

/**
 * Resolve the corresponding ItemProvider for the given item type.
 *
 * @param type
 * @returns {*}
 */
export const resolveItemComponent = ( type ) => {
	return ITEMS_COMPONENT[ type ];
};
