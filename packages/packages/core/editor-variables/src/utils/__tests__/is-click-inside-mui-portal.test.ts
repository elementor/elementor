import { isClickInsideMuiPortal } from '../is-click-inside-mui-portal';

describe( 'isClickInsideMuiPortal', () => {
	it( 'returns true when the event target is inside a MUI popover portal', () => {
		const portal = document.createElement( 'div' );
		portal.className = 'MuiPopover-root';
		const inner = document.createElement( 'button' );
		portal.appendChild( inner );
		document.body.appendChild( portal );

		const event = new MouseEvent( 'mousedown', { bubbles: true } );
		Object.defineProperty( event, 'target', { value: inner } );

		expect( isClickInsideMuiPortal( event ) ).toBe( true );

		document.body.removeChild( portal );
	} );

	it( 'returns false when the event target is outside MUI portal roots', () => {
		const element = document.createElement( 'div' );
		document.body.appendChild( element );

		const event = new MouseEvent( 'mousedown', { bubbles: true } );
		Object.defineProperty( event, 'target', { value: element } );

		expect( isClickInsideMuiPortal( event ) ).toBe( false );

		document.body.removeChild( element );
	} );
} );
