const COLOR_VARIABLE_FIELD_ID = 'color-variable-field';
const COLOR_PICKER_POPOVER_ID = 'eui-color-picker-popover';

export const isColorFieldDismissImmuneTarget = ( target: EventTarget | null ): boolean => {
	if ( ! ( target instanceof Element ) ) {
		return false;
	}

	const field = document.getElementById( COLOR_VARIABLE_FIELD_ID );

	if ( field?.contains( target ) ) {
		return true;
	}

	const pickerPopover = document.getElementById( COLOR_PICKER_POPOVER_ID );

	if ( pickerPopover?.contains( target ) ) {
		return true;
	}

	const pickerPopoverRoot = pickerPopover?.closest( '.MuiPopover-root' );

	if ( pickerPopoverRoot instanceof HTMLElement && pickerPopoverRoot.contains( target ) ) {
		return true;
	}

	if ( ! field ) {
		return false;
	}

	const expandedSelects = field.querySelectorAll( '[role="combobox"][aria-expanded="true"]' );

	for ( const select of expandedSelects ) {
		const menuId = select.getAttribute( 'aria-controls' );

		if ( ! menuId ) {
			continue;
		}

		const menu = document.getElementById( menuId );

		if ( menu?.contains( target ) ) {
			return true;
		}
	}

	return false;
};
