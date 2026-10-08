import { COLOR_VARIABLE_FIELD_ID } from '../../components/fields/color-variable-field-constants';
import { shouldIgnoreVariableCellClickAway } from '../should-ignore-variable-cell-click-away';

describe( 'shouldIgnoreVariableCellClickAway', () => {
	it( 'returns true when the click is inside the color variable field', () => {
		const colorField = document.createElement( 'div' );
		colorField.id = COLOR_VARIABLE_FIELD_ID;
		const inner = document.createElement( 'button' );
		colorField.appendChild( inner );
		document.body.appendChild( colorField );

		const event = new MouseEvent( 'mousedown', { bubbles: true } );
		Object.defineProperty( event, 'target', { value: inner } );

		expect( shouldIgnoreVariableCellClickAway( event ) ).toBe( true );

		document.body.removeChild( colorField );
	} );

	it( 'returns true when the click is inside the portaled select menu for the color field', () => {
		const colorField = document.createElement( 'div' );
		colorField.id = COLOR_VARIABLE_FIELD_ID;

		const combobox = document.createElement( 'div' );
		combobox.setAttribute( 'role', 'combobox' );
		combobox.setAttribute( 'aria-expanded', 'true' );
		combobox.setAttribute( 'aria-controls', 'format-menu' );
		colorField.appendChild( combobox );

		const menu = document.createElement( 'ul' );
		menu.id = 'format-menu';
		const menuItem = document.createElement( 'li' );
		menu.appendChild( menuItem );

		document.body.appendChild( colorField );
		document.body.appendChild( menu );

		const event = new MouseEvent( 'mousedown', { bubbles: true } );
		Object.defineProperty( event, 'target', { value: menuItem } );

		expect( shouldIgnoreVariableCellClickAway( event ) ).toBe( true );

		document.body.removeChild( colorField );
		document.body.removeChild( menu );
	} );

	it( 'returns false when the click is outside the color field and its menus', () => {
		const element = document.createElement( 'div' );
		document.body.appendChild( element );

		const event = new MouseEvent( 'mousedown', { bubbles: true } );
		Object.defineProperty( event, 'target', { value: element } );

		expect( shouldIgnoreVariableCellClickAway( event ) ).toBe( false );

		document.body.removeChild( element );
	} );
} );
