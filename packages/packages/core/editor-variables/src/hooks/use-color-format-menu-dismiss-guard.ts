import { useEffect } from 'react';

const COLOR_VARIABLE_FIELD_ID = 'color-variable-field';
const MENU_GUARD_ATTRIBUTE = 'data-color-format-menu-guard';

const stopPropagation = ( event: Event ) => {
	event.stopPropagation();
};

const attachGuardToMenuRoot = ( menuRoot: HTMLElement ) => {
	if ( menuRoot.getAttribute( MENU_GUARD_ATTRIBUTE ) === 'true' ) {
		return;
	}

	menuRoot.setAttribute( MENU_GUARD_ATTRIBUTE, 'true' );
	menuRoot.addEventListener( 'mousedown', stopPropagation );
	menuRoot.addEventListener( 'mouseup', stopPropagation );
	menuRoot.addEventListener( 'click', stopPropagation );
	menuRoot.addEventListener( 'touchstart', stopPropagation );
};

const attachGuardsForOpenFormatMenus = () => {
	const field = document.getElementById( COLOR_VARIABLE_FIELD_ID );

	if ( ! field ) {
		return;
	}

	const expandedSelects = field.querySelectorAll( '[role="combobox"][aria-expanded="true"]' );

	expandedSelects.forEach( ( select ) => {
		const menuId = select.getAttribute( 'aria-controls' );

		if ( ! menuId ) {
			return;
		}

		const menuList = document.getElementById( menuId );
		const menuRoot = menuList?.closest( '.MuiPopover-root' );

		if ( menuRoot instanceof HTMLElement ) {
			attachGuardToMenuRoot( menuRoot );
		}
	} );
};

export const useColorFormatMenuDismissGuard = () => {
	useEffect( () => {
		const observer = new MutationObserver( () => {
			attachGuardsForOpenFormatMenus();
		} );

		observer.observe( document.body, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: [ 'aria-expanded', 'aria-hidden', 'aria-controls' ],
		} );

		attachGuardsForOpenFormatMenus();

		return () => observer.disconnect();
	}, [] );
};
