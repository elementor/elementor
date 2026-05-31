import { applyDragDelta, physicalToLogicalDelta } from '../drag-math';

describe( 'physicalToLogicalDelta', () => {
	it( 'returns delta unchanged in LTR', () => {
		// Arrange / Act.
		const result = physicalToLogicalDelta( { dx: 30, dy: 10 }, false );

		// Assert.
		expect( result ).toEqual( { inlineDelta: 30, blockDelta: 10 } );
	} );

	it( 'negates the inline delta in RTL', () => {
		// Arrange / Act.
		const result = physicalToLogicalDelta( { dx: 30, dy: 10 }, true );

		// Assert.
		expect( result ).toEqual( { inlineDelta: -30, blockDelta: 10 } );
	} );

	it( 'does not touch the block delta in RTL', () => {
		// Arrange / Act.
		const result = physicalToLogicalDelta( { dx: 0, dy: -45 }, true );

		// Assert.
		expect( result.blockDelta ).toBe( -45 );
	} );
} );

describe( 'applyDragDelta', () => {
	const unboundedBounds = {
		minInlineStart: 0,
		maxInlineStart: Number.MAX_SAFE_INTEGER,
		minBlockStart: 0,
		maxBlockStart: Number.MAX_SAFE_INTEGER,
	};

	it( 'adds logical deltas to the start position', () => {
		// Arrange.
		const start = { insetInlineStart: 100, insetBlockStart: 50 };

		// Act.
		const next = applyDragDelta( start, { inlineDelta: 25, blockDelta: -10 }, unboundedBounds );

		// Assert.
		expect( next ).toEqual( { insetInlineStart: 125, insetBlockStart: 40 } );
	} );

	it( 'clamps inline-start to the side-panel minimum when dragged toward the start edge', () => {
		// Arrange.
		const start = { insetInlineStart: 320, insetBlockStart: 200 };
		const bounds = { ...unboundedBounds, minInlineStart: 300 };

		// Act.
		const next = applyDragDelta( start, { inlineDelta: -100, blockDelta: 0 }, bounds );

		// Assert.
		expect( next.insetInlineStart ).toBe( 300 );
		expect( next.insetBlockStart ).toBe( 200 );
	} );

	it( 'clamps block-start to the app-bar minimum when dragged toward the top', () => {
		// Arrange.
		const start = { insetInlineStart: 320, insetBlockStart: 60 };
		const bounds = { ...unboundedBounds, minBlockStart: 48 };

		// Act.
		const next = applyDragDelta( start, { inlineDelta: 0, blockDelta: -100 }, bounds );

		// Assert.
		expect( next.insetInlineStart ).toBe( 320 );
		expect( next.insetBlockStart ).toBe( 48 );
	} );

	it( 'clamps to the max bounds so the panel stays fully within the viewport', () => {
		// Arrange.
		const start = { insetInlineStart: 900, insetBlockStart: 700 };
		const bounds = { ...unboundedBounds, maxInlineStart: 1000, maxBlockStart: 800 };

		// Act.
		const next = applyDragDelta( start, { inlineDelta: 500, blockDelta: 500 }, bounds );

		// Assert.
		expect( next ).toEqual( { insetInlineStart: 1000, insetBlockStart: 800 } );
	} );

	it( 'clamps to the minimum when the max is smaller than the min (panel larger than free space)', () => {
		// Arrange.
		const start = { insetInlineStart: 320, insetBlockStart: 60 };
		const bounds = { minInlineStart: 300, maxInlineStart: 100, minBlockStart: 48, maxBlockStart: 10 };

		// Act.
		const next = applyDragDelta( start, { inlineDelta: 500, blockDelta: 500 }, bounds );

		// Assert.
		expect( next ).toEqual( { insetInlineStart: 300, insetBlockStart: 48 } );
	} );
} );
