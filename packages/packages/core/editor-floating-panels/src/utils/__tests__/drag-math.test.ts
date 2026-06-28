import { applyDragDelta, physicalToLogicalDelta } from '../drag-math';

const EMPTY_INSETS = { insetInlineStart: 0, insetInlineEnd: 0, insetBlockStart: 0, insetBlockEnd: 0 };

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
		minBlockStart: 0,
		maxBlockStart: Number.MAX_SAFE_INTEGER,
		minBlockEnd: 0,
		maxBlockEnd: Number.MAX_SAFE_INTEGER,
		minInlineStart: 0,
		maxInlineStart: Number.MAX_SAFE_INTEGER,
		minInlineEnd: 0,
		maxInlineEnd: Number.MAX_SAFE_INTEGER,
	};

	it( 'adds logical deltas to the start position', () => {
		// Arrange.
		const start = { ...EMPTY_INSETS, insetInlineStart: 100, insetBlockStart: 50 };

		// Act.
		const next = applyDragDelta(
			'block-start-inline-start',
			start,
			{ inlineDelta: 25, blockDelta: -10 },
			unboundedBounds
		);

		// Assert.
		expect( next ).toEqual( { ...EMPTY_INSETS, insetInlineStart: 125, insetBlockStart: 40 } );
	} );

	it( 'clamps inline-start to the side-panel minimum when dragged toward the start edge', () => {
		// Arrange.
		const start = { ...EMPTY_INSETS, insetInlineStart: 320, insetBlockStart: 200 };
		const bounds = { ...unboundedBounds, minInlineStart: 300 };

		// Act.
		const next = applyDragDelta( 'block-start-inline-start', start, { inlineDelta: -100, blockDelta: 0 }, bounds );

		// Assert.
		expect( next.insetInlineStart ).toBe( 300 );
		expect( next.insetBlockStart ).toBe( 200 );
	} );

	it( 'clamps block-start to the app-bar minimum when dragged toward the top', () => {
		// Arrange.
		const start = { ...EMPTY_INSETS, insetInlineStart: 320, insetBlockStart: 60 };
		const bounds = { ...unboundedBounds, minBlockStart: 48 };

		// Act.
		const next = applyDragDelta( 'block-start-inline-start', start, { inlineDelta: 0, blockDelta: -100 }, bounds );

		// Assert.
		expect( next.insetInlineStart ).toBe( 320 );
		expect( next.insetBlockStart ).toBe( 48 );
	} );

	it( 'clamps to the max bounds so the panel stays fully within the viewport', () => {
		// Arrange.
		const start = { ...EMPTY_INSETS, insetInlineStart: 900, insetBlockStart: 700 };
		const bounds = { ...unboundedBounds, maxInlineStart: 1000, maxBlockStart: 800 };

		// Act.
		const next = applyDragDelta( 'block-start-inline-start', start, { inlineDelta: 500, blockDelta: 500 }, bounds );

		// Assert.
		expect( next ).toEqual( { ...EMPTY_INSETS, insetInlineStart: 1000, insetBlockStart: 800 } );
	} );

	it( 'clamps to the minimum when the max is smaller than the min (panel larger than free space)', () => {
		// Arrange.
		const start = { ...EMPTY_INSETS, insetInlineStart: 320, insetBlockStart: 60 };
		const bounds = { ...unboundedBounds, minInlineStart: 300, maxInlineStart: 100, minBlockStart: 48, maxBlockStart: 10 };

		// Act.
		const next = applyDragDelta( 'block-start-inline-start', start, { inlineDelta: 500, blockDelta: 500 }, bounds );

		// Assert.
		expect( next ).toEqual( { ...EMPTY_INSETS, insetInlineStart: 300, insetBlockStart: 48 } );
	} );

	it( 'inverts deltas for block-end-inline-end', () => {
		// Arrange.
		const start = { ...EMPTY_INSETS, insetInlineEnd: 100, insetBlockEnd: 50 };

		// Act.
		const next = applyDragDelta(
			'block-end-inline-end',
			start,
			{ inlineDelta: 25, blockDelta: -10 },
			unboundedBounds
		);

		// Assert.
		expect( next ).toEqual( { ...EMPTY_INSETS, insetInlineEnd: 75, insetBlockEnd: 60 } );
	} );
} );
