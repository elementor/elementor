import { applyBlockEndResize, applyInlineEndResize, applyInlineStartResize, type ResizeBounds } from '../resize-math';

const bounds: ResizeBounds = {
	minInlineSize: 240,
	maxInlineSize: 800,
	minBlockSize: 320,
	maxBlockSize: 600,
	minInlineStart: 300,
};

describe( 'applyInlineEndResize', () => {
	it( 'grows the width by the inline delta and leaves height untouched', () => {
		// Act.
		const next = applyInlineEndResize( { inlineSize: 320, blockSize: 480 }, 100, bounds );

		// Assert.
		expect( next ).toEqual( { inlineSize: 420, blockSize: 480 } );
	} );

	it( 'clamps the width to the minimum', () => {
		// Act.
		const next = applyInlineEndResize( { inlineSize: 320, blockSize: 480 }, -1000, bounds );

		// Assert.
		expect( next.inlineSize ).toBe( 240 );
	} );

	it( 'clamps the width to the viewport maximum', () => {
		// Act.
		const next = applyInlineEndResize( { inlineSize: 320, blockSize: 480 }, 1000, bounds );

		// Assert.
		expect( next.inlineSize ).toBe( 800 );
	} );

	it( 'clamps to the minimum when the max is smaller than the min (panel larger than free space)', () => {
		// Arrange.
		const tightBounds = { ...bounds, minInlineSize: 240, maxInlineSize: 100 };

		// Act.
		const next = applyInlineEndResize( { inlineSize: 320, blockSize: 480 }, 1000, tightBounds );

		// Assert.
		expect( next.inlineSize ).toBe( 240 );
	} );
} );

describe( 'applyBlockEndResize', () => {
	it( 'grows the height by the block delta and leaves width untouched', () => {
		// Act.
		const next = applyBlockEndResize( { inlineSize: 320, blockSize: 480 }, 80, bounds );

		// Assert.
		expect( next ).toEqual( { inlineSize: 320, blockSize: 560 } );
	} );

	it( 'clamps the height between min and max', () => {
		// Act.
		const tooSmall = applyBlockEndResize( { inlineSize: 320, blockSize: 480 }, -1000, bounds );
		const tooLarge = applyBlockEndResize( { inlineSize: 320, blockSize: 480 }, 1000, bounds );

		// Assert.
		expect( tooSmall.blockSize ).toBe( 320 );
		expect( tooLarge.blockSize ).toBe( 600 );
	} );
} );

describe( 'applyInlineStartResize', () => {
	it( 'moves the start inward and grows the width while anchoring the inline-end edge', () => {
		// Arrange — start edge at 500, width 320 => inline-end anchored at 820.
		const position = { insetInlineStart: 500, insetBlockStart: 200 };
		const size = { inlineSize: 320, blockSize: 480 };

		// Act — drag the start edge 100px toward the start (negative inline delta).
		const next = applyInlineStartResize( position, size, -100, bounds );

		// Assert.
		expect( next.position.insetInlineStart ).toBe( 400 );
		expect( next.size.inlineSize ).toBe( 420 );
		expect( next.position.insetInlineStart + next.size.inlineSize ).toBe( 820 );
	} );

	it( 'clamps the start to the side-panel minimum', () => {
		// Arrange — inline-end anchored at 820.
		const position = { insetInlineStart: 500, insetBlockStart: 200 };
		const size = { inlineSize: 320, blockSize: 480 };

		// Act — drag far past the side panel.
		const next = applyInlineStartResize( position, size, -1000, bounds );

		// Assert.
		expect( next.position.insetInlineStart ).toBe( 300 );
		expect( next.size.inlineSize ).toBe( 520 );
	} );

	it( 'clamps the width to the minimum when shrinking (start cannot pass the min-width line)', () => {
		// Arrange — inline-end anchored at 820, min width 240 => max start 580.
		const position = { insetInlineStart: 500, insetBlockStart: 200 };
		const size = { inlineSize: 320, blockSize: 480 };

		// Act — drag the start edge toward the end (positive inline delta).
		const next = applyInlineStartResize( position, size, 1000, bounds );

		// Assert.
		expect( next.position.insetInlineStart ).toBe( 580 );
		expect( next.size.inlineSize ).toBe( 240 );
	} );
} );
