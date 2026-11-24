import { getAnchoredAncestorId, isElementAnchored, type V1Element } from '@elementor/editor-elements';

import {
	type ClipboardElement,
	getElementType,
	hasClipboardElementType,
	hasElementType,
	hasModelElementType,
} from '../form-structure/utils';

export const MENU_ELEMENT_TYPE = 'e-menu';
export const SUBMENU_ELEMENT_TYPE = 'e-menu-submenu';

type Model = Parameters< typeof hasModelElementType >[ 0 ];

export function modelContainsMenu( model?: Model ): boolean {
	return hasModelElementType( model, MENU_ELEMENT_TYPE );
}

export function containersContainMenu( containers: ( V1Element | undefined )[] ): boolean {
	return containers.some( ( container ) => ( container ? hasElementType( container, MENU_ELEMENT_TYPE ) : false ) );
}

export function clipboardContainsMenu( elements: ClipboardElement[] ): boolean {
	return hasClipboardElementType( elements, MENU_ELEMENT_TYPE );
}

export function isInsideLink( target?: V1Element ): boolean {
	return target?.id ? isElementAnchored( target.id ) || !! getAnchoredAncestorId( target.id ) : false;
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
