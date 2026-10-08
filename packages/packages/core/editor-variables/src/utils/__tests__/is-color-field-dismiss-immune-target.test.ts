import {
	isColorFieldDismissImmuneEvent,
	isColorFieldDismissImmuneTarget,
} from '../is-color-field-dismiss-immune-target';

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

	it( 'returns true for the color picker popover while the color field is mounted', () => {
		const field = document.createElement( 'div' );
		field.id = 'color-variable-field';
		document.body.appendChild( field );

		const popover = document.createElement( 'div' );
		popover.id = 'eui-color-picker-popover';
		document.body.appendChild( popover );

		expect( isColorFieldDismissImmuneTarget( popover ) ).toBe( true );

		document.body.removeChild( field );
		document.body.removeChild( popover );
	} );

	it( 'returns true for the format combobox while the color field is mounted', () => {
		const field = document.createElement( 'div' );
		field.id = 'color-variable-field';
		document.body.appendChild( field );

		const combobox = document.createElement( 'div' );
		combobox.setAttribute( 'role', 'combobox' );
		document.body.appendChild( combobox );

		expect( isColorFieldDismissImmuneTarget( combobox ) ).toBe( true );

		document.body.removeChild( field );
		document.body.removeChild( combobox );
	} );

	it( 'returns false for unrelated targets outside edit mode', () => {
		const element = document.createElement( 'div' );
		document.body.appendChild( element );

		expect( isColorFieldDismissImmuneTarget( element ) ).toBe( false );

		document.body.removeChild( element );
	} );
} );

describe( 'isColorFieldDismissImmuneEvent', () => {
	it( 'returns true for a portaled menu when the color field is in an iframe document', () => {
		const iframe = document.createElement( 'iframe' );
		document.body.appendChild( iframe );

		const iframeDocument = iframe.contentDocument as Document;
		const field = iframeDocument.createElement( 'div' );
		field.id = 'color-variable-field';
		iframeDocument.body.appendChild( field );

		const menuItem = document.createElement( 'li' );
		menuItem.setAttribute( 'role', 'option' );
		const menu = document.createElement( 'ul' );
		menu.setAttribute( 'role', 'listbox' );
		menu.className = 'MuiMenu-root';
		menu.appendChild( menuItem );
		document.body.appendChild( menu );

		expect( isColorFieldDismissImmuneTarget( menuItem ) ).toBe( true );

		document.body.removeChild( iframe );
		document.body.removeChild( menu );
	} );

	it( 'returns true when composedPath includes an immune node', () => {
		const field = document.createElement( 'div' );
		field.id = 'color-variable-field';
		const combobox = document.createElement( 'div' );
		combobox.setAttribute( 'role', 'combobox' );
		document.body.appendChild( field );
		document.body.appendChild( combobox );

		const event = new MouseEvent( 'click', { bubbles: true, composed: true } );
		Object.defineProperty( event, 'composedPath', {
			value: () => [ combobox, document.body, document ],
		} );

		expect( isColorFieldDismissImmuneEvent( event ) ).toBe( true );

		document.body.removeChild( field );
		document.body.removeChild( combobox );
	} );
} );
