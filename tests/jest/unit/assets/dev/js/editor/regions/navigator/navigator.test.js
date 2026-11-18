jest.mock( 'elementor-regions/base', () => class {}, { virtual: true } );
jest.mock( 'elementor/assets/dev/js/editor/regions/navigator/component', () => class {}, { virtual: true } );
jest.mock( 'elementor/assets/dev/js/editor/regions/navigator/layout', () => class {}, { virtual: true } );

describe( 'Navigator edge crossings', () => {
	const PANEL_WIDTH = 200;
	const DOCKED_WIDTH = 300;

	let Navigator;

	beforeAll( async () => {
		Navigator = ( await import( 'elementor/assets/dev/js/editor/regions/navigator/navigator' ) ).default;
	} );

	beforeEach( () => {
		window.innerWidth = 1000;
	} );

	const getCrossings = ( left, isRTL ) => {
		global.elementorCommon = { config: { isRTL } };

		return Navigator.prototype.getEdgeCrossings.call( {
			el: { offsetWidth: PANEL_WIDTH },
			getDockedFloatingPanelWidth: () => DOCKED_WIDTH,
		}, left );
	};

	it( 'offsets the right edge by the docked panel width in LTR', () => {
		// Act.
		const inside = getCrossings( 1000 - DOCKED_WIDTH - PANEL_WIDTH, false );
		const crossing = getCrossings( 1000 - DOCKED_WIDTH - PANEL_WIDTH + 1, false );

		// Assert.
		expect( inside ).toEqual( { isOutOfLeft: false, isOutOfRight: false, isOutOfDockEdge: false } );
		expect( crossing ).toEqual( { isOutOfLeft: false, isOutOfRight: true, isOutOfDockEdge: true } );
	} );

	it( 'offsets the left edge by the docked panel width in RTL', () => {
		// Act.
		const inside = getCrossings( DOCKED_WIDTH, true );
		const crossing = getCrossings( DOCKED_WIDTH - 1, true );

		// Assert.
		expect( inside ).toEqual( { isOutOfLeft: false, isOutOfRight: false, isOutOfDockEdge: false } );
		expect( crossing ).toEqual( { isOutOfLeft: true, isOutOfRight: false, isOutOfDockEdge: true } );
	} );

	it( 'does not treat the non-dock edge as a dock hint', () => {
		// Act.
		const ltr = getCrossings( -1, false );
		const rtl = getCrossings( 1000 - PANEL_WIDTH + 1, true );

		// Assert.
		expect( ltr.isOutOfDockEdge ).toBe( false );
		expect( rtl.isOutOfDockEdge ).toBe( false );
	} );
} );
