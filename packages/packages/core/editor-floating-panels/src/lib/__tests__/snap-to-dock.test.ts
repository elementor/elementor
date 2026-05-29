import { shouldSnapToDock, SNAP_THRESHOLD_PX } from '../snap-to-dock';

describe( 'shouldSnapToDock', () => {
	const viewport = { left: 0, right: 1200, top: 0, bottom: 800 };

	it( 'snaps when the panel right edge is within the threshold of viewport right (LTR)', () => {
		// Arrange.
		const panel = { left: 900, right: 1200 - 4, top: 100, bottom: 600 };

		// Act / Assert.
		expect( shouldSnapToDock( { panel, viewport, isRtl: false } ) ).toBe( true );
	} );

	it( 'does not snap when the panel is far from the inline-end edge (LTR)', () => {
		// Arrange.
		const panel = { left: 100, right: 500, top: 100, bottom: 600 };

		// Act / Assert.
		expect( shouldSnapToDock( { panel, viewport, isRtl: false } ) ).toBe( false );
	} );

	it( 'snaps when the panel left edge is within the threshold of viewport left (RTL)', () => {
		// Arrange.
		const panel = { left: 3, right: 300, top: 100, bottom: 600 };

		// Act / Assert.
		expect( shouldSnapToDock( { panel, viewport, isRtl: true } ) ).toBe( true );
	} );

	it( 'does not snap when the panel is far from the inline-end edge (RTL)', () => {
		// Arrange.
		const panel = { left: 700, right: 1100, top: 100, bottom: 600 };

		// Act / Assert.
		expect( shouldSnapToDock( { panel, viewport, isRtl: true } ) ).toBe( false );
	} );

	it( 'exposes the threshold as a named constant', () => {
		expect( typeof SNAP_THRESHOLD_PX ).toBe( 'number' );
		expect( SNAP_THRESHOLD_PX ).toBeGreaterThan( 0 );
	} );
} );
