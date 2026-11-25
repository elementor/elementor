import { type V1Element } from '@elementor/editor-elements';

import { getElementType } from '../form-structure/utils';

export const MENU_ELEMENT_TYPE = 'e-menu';
export const SUBMENU_ELEMENT_TYPE = 'e-menu-submenu';

export type ElementData = {
	elType?: string;
	widgetType?: string;
	elements?: ElementData[];
	settings?: { link?: { value?: { destination?: unknown } | null } | null };
};

type Search = {
	skipSubmenus?: boolean;
	onlyUnderLink?: boolean;
};

export function dataContainsMenu( elements: ( ElementData | undefined )[], search: Search = {} ): boolean {
	return elements.some( ( element ) => dataNodeContainsMenu( element, search, false ) );
}

function dataNodeContainsMenu( element: ElementData | undefined, search: Search, isUnderLink: boolean ): boolean {
	if ( ! element ) {
		return false;
	}

	const type = element.widgetType || element.elType;

	if ( type === MENU_ELEMENT_TYPE && ( ! search.onlyUnderLink || isUnderLink ) ) {
		return true;
	}

	if ( type === SUBMENU_ELEMENT_TYPE && search.skipSubmenus ) {
		return false;
	}

	const isLinked = isUnderLink || !! element.settings?.link?.value?.destination;

	return ( element.elements ?? [] ).some( ( child ) => dataNodeContainsMenu( child, search, isLinked ) );
}

export function containersContainMenu(
	containers: ( V1Element | undefined )[],
	search: Pick< Search, 'skipSubmenus' > = {}
): boolean {
	return containers.some( ( container ) => containerContainsMenu( container, search ) );
}

function containerContainsMenu( container: V1Element | undefined, search: Pick< Search, 'skipSubmenus' > ): boolean {
	if ( ! container ) {
		return false;
	}

	const type = getElementType( container );

	if ( type === MENU_ELEMENT_TYPE ) {
		return true;
	}

	if ( type === SUBMENU_ELEMENT_TYPE && search.skipSubmenus ) {
		return false;
	}

	return ( container.children ?? [] ).some( ( child ) => containerContainsMenu( child, search ) );
}

export function isInsideMenu( target?: V1Element ): boolean {
	let current = target;

	while ( current ) {
		const type = getElementType( current );

		if ( type === SUBMENU_ELEMENT_TYPE ) {
			return false;
		}

		if ( type === MENU_ELEMENT_TYPE ) {
			return true;
		}

		current = current.parent;
	}

	return false;
}
