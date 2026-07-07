import { APP_BAR_HEIGHT_PX, getSidePanelInlineSize } from '../viewport-bounds';

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
} );
