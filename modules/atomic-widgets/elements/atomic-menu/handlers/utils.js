export const ITEMS_ELEMENT_TYPE = 'e-menu-items';
export const TOGGLE_ELEMENT_TYPE = 'e-menu-toggle';
export const TOGGLE_CLOSED_ELEMENT_TYPE = 'e-menu-toggle-closed';
export const TOGGLE_OPEN_ELEMENT_TYPE = 'e-menu-toggle-open';

const getDirectChild = ( menu, elementType ) => {
	return Array.from( menu.children ).find( ( child ) => child.dataset.element_type === elementType ) ?? null;
};

export const getItems = ( menu ) => getDirectChild( menu, ITEMS_ELEMENT_TYPE );

export const getToggle = ( menu ) => getDirectChild( menu, TOGGLE_ELEMENT_TYPE );

export const getItemsId = ( menuId ) => `e-menu-items-${ menuId }`;
