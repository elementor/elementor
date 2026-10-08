import { useEffect } from 'react';

const COLOR_VARIABLE_FIELD_ID = 'color-variable-field';
const COLOR_PICKER_POPOVER_ID = 'eui-color-picker-popover';
const POINTER_GUARD_ATTRIBUTE = 'data-color-format-pointer-guard';

const POINTER_EVENT_TYPES = [ 'mousedown', 'mouseup', 'click', 'touchstart' ] as const;

const stopPropagation = ( event: Event ) => {
	event.stopPropagation();
};

const attachPointerEventGuard = ( element: HTMLElement ) => {
	if ( element.getAttribute( POINTER_GUARD_ATTRIBUTE ) === 'true' ) {
		return;
	}

	element.setAttribute( POINTER_GUARD_ATTRIBUTE, 'true' );

	POINTER_EVENT_TYPES.forEach( ( eventType ) => {
		element.addEventListener( eventType, stopPropagation );
	} );
};

const attachGuardsForOpenFormatMenus = ( field: HTMLElement ) => {
	const expandedSelects = field.querySelectorAll( '[role="combobox"][aria-expanded="true"]' );

	expandedSelects.forEach( ( select ) => {
		const menuId = select.getAttribute( 'aria-controls' );

		if ( ! menuId ) {
			return;
		}

		const menuList = document.getElementById( menuId );
		const menuRoot = menuList?.closest( '.MuiPopover-root' );

		if ( menuRoot instanceof HTMLElement ) {
			attachPointerEventGuard( menuRoot );
		}
	} );
};

const attachGuardsForColorFieldInteractions = () => {
	const field = document.getElementById( COLOR_VARIABLE_FIELD_ID );

	if ( field instanceof HTMLElement ) {
		attachPointerEventGuard( field );
		attachGuardsForOpenFormatMenus( field );
	}

	const pickerPopover = document.getElementById( COLOR_PICKER_POPOVER_ID );
	const pickerPopoverRoot = pickerPopover?.closest( '.MuiPopover-root' );

	if ( pickerPopoverRoot instanceof HTMLElement ) {
		attachPointerEventGuard( pickerPopoverRoot );
	}
};

export const useColorFormatMenuDismissGuard = () => {
	useEffect( () => {
		const observer = new MutationObserver( () => {
			attachGuardsForColorFieldInteractions();
		} );

		observer.observe( document.body, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: [ 'aria-expanded', 'aria-hidden', 'aria-controls', 'id' ],
		} );

		attachGuardsForColorFieldInteractions();

		return () => observer.disconnect();
	}, [] );
};
