import { COLOR_VARIABLE_FIELD_ID } from '../components/fields/color-variable-field-constants';

const getEventTargetElement = ( event: MouseEvent | TouchEvent ): Element | null => {
	const target = event.target;

	if ( target instanceof Element ) {
		return target;
	}

	return null;
};

const isTargetInsidePortaledSelectMenu = ( colorField: HTMLElement, target: Element ): boolean => {
	const expandedSelects = colorField.querySelectorAll( '[role="combobox"][aria-expanded="true"]' );

	for ( const select of expandedSelects ) {
		const menuId = select.getAttribute( 'aria-controls' );

		if ( ! menuId ) {
			continue;
		}

		const menu = colorField.ownerDocument.getElementById( menuId );

		if ( menu?.contains( target ) ) {
			return true;
		}
	}

	return false;
};

export const shouldIgnoreVariableCellClickAway = ( event: MouseEvent | TouchEvent ): boolean => {
	const target = getEventTargetElement( event );

	if ( ! target ) {
		return false;
	}

	const colorField = target.ownerDocument.getElementById( COLOR_VARIABLE_FIELD_ID );

	if ( ! colorField ) {
		return false;
	}

	if ( colorField.contains( target ) ) {
		return true;
	}

	return isTargetInsidePortaledSelectMenu( colorField, target );
};
