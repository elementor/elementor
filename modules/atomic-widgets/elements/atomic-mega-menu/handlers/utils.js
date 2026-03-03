export const ITEM_ELEMENT_TYPE = 'e-mega-menu-item';
export const PANEL_ELEMENT_TYPE = 'e-mega-menu-panel';
export const NAV_ELEMENT_TYPE = 'e-mega-menu-nav';
export const CONTENT_AREA_ELEMENT_TYPE = 'e-mega-menu-content-area';

export const getItemId = ( megaMenuId, index ) => {
	return `${ megaMenuId }-item-${ index }`;
};

export const getPanelId = ( megaMenuId, index ) => {
	return `${ megaMenuId }-panel-${ index }`;
};

export const getChildren = ( el, elementType ) => {
	const parent = el.parentElement;

	return Array.from( parent.children ).filter( ( child ) => {
		return child.dataset.element_type === elementType;
	} );
};

export const getIndex = ( el, elementType ) => {
	const children = getChildren( el, elementType );

	return children.indexOf( el );
};
