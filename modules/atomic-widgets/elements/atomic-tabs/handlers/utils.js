export const TAB_ELEMENT_TYPE = 'e-tab';
export const TAB_CONTENT_ELEMENT_TYPE = 'e-tab-content';
export const TABS_CONTENT_AREA_ELEMENT_TYPE = 'e-tabs-content-area';
export const TABS_MENU_ELEMENT_TYPE = 'e-tabs-menu';

const NAVIGATE_UP_KEYS = [ 'ArrowUp', 'ArrowLeft' ];
const NAVIGATE_DOWN_KEYS = [ 'ArrowDown', 'ArrowRight' ];

export const getTabId = ( tabsId, tabIndex ) => {
	return `${ tabsId }-tab-${ tabIndex }`;
};

export const getTabContentId = ( tabsId, tabIndex ) => {
	return `${ tabsId }-tab-content-${ tabIndex }`;
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

export const getNextTab = ( key, tab ) => {
	const tabs = getChildren( tab, TAB_ELEMENT_TYPE );
	const tabsLength = tabs.length;

	const currentIndex = getIndex( tab, TAB_ELEMENT_TYPE );

	if ( NAVIGATE_DOWN_KEYS.includes( key ) ) {
		return tabs[ ( currentIndex + 1 ) % tabsLength ];
	}

	if ( NAVIGATE_UP_KEYS.includes( key ) ) {
		return tabs[ ( currentIndex - 1 + tabsLength ) % tabsLength ];
	}
};
