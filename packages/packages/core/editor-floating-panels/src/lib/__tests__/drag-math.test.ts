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
	it( 'adds logical deltas to the start position', () => {
		// Arrange.
		const start = { insetInlineStart: 100, insetBlockStart: 50 };

		// Act.
		const next = applyDragDelta( start, { inlineDelta: 25, blockDelta: -10 } );

		// Assert.
		expect( next ).toEqual( { insetInlineStart: 125, insetBlockStart: 40 } );
	} );

	it( 'clamps inline-start at 0 when the inline delta would push it negative', () => {
		// Arrange.
		const start = { insetInlineStart: 5, insetBlockStart: 80 };

		// Act.
		const next = applyDragDelta( start, { inlineDelta: -100, blockDelta: 0 } );

		// Assert.
		expect( next.insetInlineStart ).toBe( 0 );
		expect( next.insetBlockStart ).toBe( 80 );
	} );

	it( 'clamps block-start at 0 when the block delta would push it negative', () => {
		// Arrange.
		const start = { insetInlineStart: 80, insetBlockStart: 5 };

		// Act.
		const next = applyDragDelta( start, { inlineDelta: 0, blockDelta: -100 } );

		// Assert.
		expect( next.insetInlineStart ).toBe( 80 );
		expect( next.insetBlockStart ).toBe( 0 );
	} );
} );
