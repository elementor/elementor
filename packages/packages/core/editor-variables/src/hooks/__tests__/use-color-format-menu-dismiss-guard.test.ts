import { renderHook } from '@testing-library/react';

import { useColorFormatMenuDismissGuard } from '../use-color-format-menu-dismiss-guard';

describe( 'useColorFormatMenuDismissGuard', () => {
	it( 'stops propagation on the portaled format menu root', () => {
		const colorField = document.createElement( 'div' );
		colorField.id = 'color-variable-field';

		const combobox = document.createElement( 'div' );
		combobox.setAttribute( 'role', 'combobox' );
		combobox.setAttribute( 'aria-expanded', 'true' );
		combobox.setAttribute( 'aria-controls', 'format-menu' );
		colorField.appendChild( combobox );

		const menuRoot = document.createElement( 'div' );
		menuRoot.className = 'MuiPopover-root';
		const menuList = document.createElement( 'ul' );
		menuList.id = 'format-menu';
		menuRoot.appendChild( menuList );

		document.body.appendChild( colorField );
		document.body.appendChild( menuRoot );

		renderHook( () => useColorFormatMenuDismissGuard() );

		const propagated = jest.fn();
		document.addEventListener( 'mouseup', propagated );

		const event = new MouseEvent( 'mouseup', { bubbles: true } );
		menuList.dispatchEvent( event );

		expect( propagated ).not.toHaveBeenCalled();

		document.removeEventListener( 'mouseup', propagated );
		document.body.removeChild( colorField );
		document.body.removeChild( menuRoot );
	} );
} );
