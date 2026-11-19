import { NAVIGATOR_DOCKED_BODY_CLASS, NAVIGATOR_WIDTH_VAR } from '../../hooks/use-docked-layout';
import { APP_BAR_HEIGHT_PX, getDockedMaxInlineSize, getSidePanelInlineSize } from '../viewport-bounds';

const SIDE_PANEL_WIDTH_PX = 280;

describe( 'viewport-bounds', () => {
	afterEach( () => {
		document.body.innerHTML = '';
	} );

	it( 'exports the app bar height constant', () => {
		// Assert.
		expect( APP_BAR_HEIGHT_PX ).toBe( 48 );
	} );

	it( 'returns zero when the side panel is absent', () => {
		// Act.
		const inlineSize = getSidePanelInlineSize();

		// Assert.
		expect( inlineSize ).toBe( 0 );
	} );

	it( 'returns the side panel width from the DOM', () => {
		// Arrange.
		const sidePanel = document.createElement( 'div' );
		sidePanel.id = 'elementor-panel';
		jest.spyOn( sidePanel, 'getBoundingClientRect' ).mockReturnValue( {
			width: SIDE_PANEL_WIDTH_PX,
		} as DOMRect );
		document.body.appendChild( sidePanel );

		// Act.
		const inlineSize = getSidePanelInlineSize();

		// Assert.
		expect( inlineSize ).toBe( SIDE_PANEL_WIDTH_PX );
	} );

	it( 'clamps docked max inline size after subtracting the docked navigator', () => {
		const sidePanel = document.createElement( 'div' );
		sidePanel.id = 'elementor-panel';
		jest.spyOn( sidePanel, 'getBoundingClientRect' ).mockReturnValue( { width: 0 } as DOMRect );
		document.body.appendChild( sidePanel );

		Object.defineProperty( window, 'innerWidth', { configurable: true, value: 1000 } );
		document.body.classList.add( NAVIGATOR_DOCKED_BODY_CLASS );
		document.body.style.setProperty( NAVIGATOR_WIDTH_VAR, '330px' );

		expect( getDockedMaxInlineSize( 240 ) ).toBe( 670 );
		expect( getDockedMaxInlineSize( 900 ) ).toBe( 900 );
	} );
} );
