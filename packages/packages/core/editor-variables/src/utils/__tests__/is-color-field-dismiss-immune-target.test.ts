import { isColorFieldDismissImmuneTarget } from '../is-color-field-dismiss-immune-target';

describe( 'isColorFieldDismissImmuneTarget', () => {
	it( 'returns true for targets inside the color variable field', () => {
		const field = document.createElement( 'div' );
		field.id = 'color-variable-field';
		const inner = document.createElement( 'span' );
		field.appendChild( inner );
		document.body.appendChild( field );

		expect( isColorFieldDismissImmuneTarget( inner ) ).toBe( true );

		document.body.removeChild( field );
	} );

	it( 'returns true for targets inside the color picker popover', () => {
		const picker = document.createElement( 'div' );
		picker.id = 'eui-color-picker-popover';
		const combobox = document.createElement( 'div' );
		picker.appendChild( combobox );
		document.body.appendChild( picker );

		expect( isColorFieldDismissImmuneTarget( combobox ) ).toBe( true );

		document.body.removeChild( picker );
	} );

	it( 'returns true for targets inside the portaled format menu', () => {
		const field = document.createElement( 'div' );
		field.id = 'color-variable-field';

		const combobox = document.createElement( 'div' );
		combobox.setAttribute( 'role', 'combobox' );
		combobox.setAttribute( 'aria-expanded', 'true' );
		combobox.setAttribute( 'aria-controls', 'format-menu' );
		field.appendChild( combobox );

		const menu = document.createElement( 'ul' );
		menu.id = 'format-menu';
		const menuItem = document.createElement( 'li' );
		menu.appendChild( menuItem );

		document.body.appendChild( field );
		document.body.appendChild( menu );

		expect( isColorFieldDismissImmuneTarget( menuItem ) ).toBe( true );

		document.body.removeChild( field );
		document.body.removeChild( menu );
	} );

	it( 'returns false for unrelated targets', () => {
		const element = document.createElement( 'div' );
		document.body.appendChild( element );

		expect( isColorFieldDismissImmuneTarget( element ) ).toBe( false );

		document.body.removeChild( element );
	} );
} );
