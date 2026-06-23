import {
	applyBlockEndResize,
	applyBlockStartResize,
	applyInlineEndResize,
	applyInlineStartResize,
	applyResize,
	type ResizeBounds,
} from '../resize-math';

const bounds: ResizeBounds = {
	minInlineSize: 240,
	maxInlineSize: 800,
	minBlockSize: 320,
	maxBlockSize: 600,
	minInlineStart: 300,
	minBlockStart: 80,
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

describe( 'applyBlockStartResize', () => {
	it( 'moves block-start upward and grows height while anchoring block-end', () => {
		// Arrange — block-start at 200, height 480 => block-end anchored at 680.
		const position = { insetInlineStart: 500, insetBlockStart: 200 };
		const size = { inlineSize: 320, blockSize: 480 };

		// Act — drag 50px upward (negative block delta).
		const next = applyBlockStartResize( position, size, -50, bounds );

		// Assert.
		expect( next.position.insetBlockStart ).toBe( 150 );
		expect( next.size.blockSize ).toBe( 530 );
		expect( next.position.insetBlockStart + next.size.blockSize ).toBe( 680 );
	} );

	it( 'clamps block-start to minBlockStart (app bar)', () => {
		// Arrange — block-end anchored at 680.
		const position = { insetInlineStart: 500, insetBlockStart: 200 };
		const size = { inlineSize: 320, blockSize: 480 };

		// Act — drag far above the app bar.
		const next = applyBlockStartResize( position, size, -1000, bounds );

		// Assert.
		expect( next.position.insetBlockStart ).toBe( 80 );
		expect( next.size.blockSize ).toBe( 600 );
	} );

	it( 'clamps height to minBlockSize when shrinking', () => {
		// Arrange — block-end anchored at 680, min height 320 => max block-start 360.
		const position = { insetInlineStart: 500, insetBlockStart: 200 };
		const size = { inlineSize: 320, blockSize: 480 };

		// Act — drag downward (positive block delta).
		const next = applyBlockStartResize( position, size, 1000, bounds );

		// Assert.
		expect( next.position.insetBlockStart ).toBe( 360 );
		expect( next.size.blockSize ).toBe( 320 );
	} );
} );

describe( 'applyResize', () => {
	const position = { insetInlineStart: 500, insetBlockStart: 200 };
	const size = { inlineSize: 320, blockSize: 480 };

	it( 'delegates inline-end resizing without moving the panel', () => {
		// Act.
		const next = applyResize( 'inline-end', position, size, 40, 0, bounds );

		// Assert.
		expect( next.position ).toEqual( position );
		expect( next.size ).toEqual( { inlineSize: 360, blockSize: 480 } );
	} );

	it( 'delegates block-end resizing without moving the panel', () => {
		// Act.
		const next = applyResize( 'block-end', position, size, 0, 60, bounds );

		// Assert.
		expect( next.position ).toEqual( position );
		expect( next.size ).toEqual( { inlineSize: 320, blockSize: 540 } );
	} );

	it( 'delegates inline-start resizing and updates position', () => {
		// Act.
		const next = applyResize( 'inline-start', position, size, -80, 0, bounds );

		// Assert.
		expect( next.position.insetInlineStart ).toBe( 420 );
		expect( next.size.inlineSize ).toBe( 400 );
	} );

	it( 'delegates block-start resizing and updates position', () => {
		// Act.
		const next = applyResize( 'block-start', position, size, 0, -40, bounds );

		// Assert.
		expect( next.position.insetBlockStart ).toBe( 160 );
		expect( next.size.blockSize ).toBe( 520 );
	} );

	it( 'resizes the block-end-inline-end corner', () => {
		// Act.
		const next = applyResize( 'block-end-inline-end', position, size, 30, 20, bounds );

		// Assert.
		expect( next.position ).toEqual( position );
		expect( next.size ).toEqual( { inlineSize: 350, blockSize: 500 } );
	} );

	it( 'resizes the block-start-inline-start corner', () => {
		// Act.
		const next = applyResize( 'block-start-inline-start', position, size, -50, -30, bounds );

		// Assert.
		expect( next.position.insetInlineStart ).toBe( 450 );
		expect( next.position.insetBlockStart ).toBe( 170 );
		expect( next.size ).toEqual( { inlineSize: 370, blockSize: 510 } );
	} );

	it( 'resizes the block-end-inline-start corner', () => {
		// Act.
		const next = applyResize( 'block-end-inline-start', position, size, -40, 25, bounds );

		// Assert.
		expect( next.position.insetInlineStart ).toBe( 460 );
		expect( next.position.insetBlockStart ).toBe( 200 );
		expect( next.size ).toEqual( { inlineSize: 360, blockSize: 505 } );
	} );

	it( 'resizes the block-start-inline-end corner', () => {
		// Act.
		const next = applyResize( 'block-start-inline-end', position, size, 35, -20, bounds );

		// Assert.
		expect( next.position.insetInlineStart ).toBe( 500 );
		expect( next.position.insetBlockStart ).toBe( 180 );
		expect( next.size ).toEqual( { inlineSize: 355, blockSize: 500 } );
	} );
} );
