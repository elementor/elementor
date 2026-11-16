import type { LogicalPosition, LogicalSize } from '../../types';
import {
	buildInitialPosition,
	fromStartAnchoredPosition,
	getActiveInsetKeys,
	getDragBounds,
	type PanelCorner,
	positionToCssInsets,
	toStartAnchoredPosition,
} from '../corner-position';
import { APP_BAR_HEIGHT_PX } from '../viewport-bounds';

const VIEWPORT = { width: 1200, height: 900 };
const SIZE: LogicalSize = { inlineSize: 320, blockSize: 480 };
const SIDE_PANEL_INLINE_SIZE_PX = 280;

describe( 'corner-position', () => {
	it.each< [ PanelCorner, [ keyof LogicalPosition, keyof LogicalPosition ] ] >( [
		[ 'block-start-inline-start', [ 'insetInlineStart', 'insetBlockStart' ] ],
		[ 'block-start-inline-end', [ 'insetInlineEnd', 'insetBlockStart' ] ],
		[ 'block-end-inline-start', [ 'insetInlineStart', 'insetBlockEnd' ] ],
		[ 'block-end-inline-end', [ 'insetInlineEnd', 'insetBlockEnd' ] ],
	] )( 'getActiveInsetKeys for %s', ( corner, expected ) => {
		expect( getActiveInsetKeys( corner ) ).toEqual( expected );
	} );

	it( 'buildInitialPosition defaults for block-start-inline-start', () => {
		expect( buildInitialPosition( 'block-start-inline-start' ) ).toEqual( {
			insetBlockStart: 80,
			insetBlockEnd: 0,
			insetInlineStart: 24,
			insetInlineEnd: 0,
		} );
	} );

	it( 'buildInitialPosition merges overrides for block-end-inline-end', () => {
		expect( buildInitialPosition( 'block-end-inline-end', { insetInlineEnd: 40, insetBlockEnd: 60 } ) ).toEqual( {
			insetBlockStart: 0,
			insetBlockEnd: 60,
			insetInlineStart: 0,
			insetInlineEnd: 40,
		} );
	} );

	it( 'positionToCssInsets maps block-end-inline-end', () => {
		const position: LogicalPosition = {
			insetBlockStart: 0,
			insetBlockEnd: 80,
			insetInlineStart: 0,
			insetInlineEnd: 24,
		};

		expect( positionToCssInsets( 'block-end-inline-end', position ) ).toEqual( {
			insetBlockEnd: '80px',
			insetInlineEnd: '24px',
		} );
	} );

	it( 'round-trips through start-anchored coordinates for block-end-inline-end', () => {
		const position = buildInitialPosition( 'block-end-inline-end' );
		const startAnchored = toStartAnchoredPosition( 'block-end-inline-end', position, SIZE, VIEWPORT );
		const restored = fromStartAnchoredPosition( 'block-end-inline-end', startAnchored, SIZE, VIEWPORT );

		expect( restored ).toEqual( position );
	} );

	it( 'getDragBounds returns normal bounds within the viewport', () => {
		expect( getDragBounds( SIZE, VIEWPORT, SIDE_PANEL_INLINE_SIZE_PX, APP_BAR_HEIGHT_PX ) ).toEqual( {
			minInlineStart: SIDE_PANEL_INLINE_SIZE_PX,
			maxInlineStart: VIEWPORT.width - SIZE.inlineSize,
			minInlineEnd: 0,
			maxInlineEnd: VIEWPORT.width - SIDE_PANEL_INLINE_SIZE_PX - SIZE.inlineSize,
			minBlockStart: APP_BAR_HEIGHT_PX,
			maxBlockStart: VIEWPORT.height - SIZE.blockSize,
			minBlockEnd: 0,
			maxBlockEnd: VIEWPORT.height - APP_BAR_HEIGHT_PX - SIZE.blockSize,
		} );
	} );

	it( 'getDragBounds allows inverted bounds when the panel exceeds the viewport', () => {
		const oversizedSize: LogicalSize = { inlineSize: 1000, blockSize: 900 };

		expect( getDragBounds( oversizedSize, VIEWPORT, SIDE_PANEL_INLINE_SIZE_PX, APP_BAR_HEIGHT_PX ) ).toEqual( {
			minInlineStart: SIDE_PANEL_INLINE_SIZE_PX,
			maxInlineStart: VIEWPORT.width - oversizedSize.inlineSize,
			minInlineEnd: 0,
			maxInlineEnd: VIEWPORT.width - SIDE_PANEL_INLINE_SIZE_PX - oversizedSize.inlineSize,
			minBlockStart: APP_BAR_HEIGHT_PX,
			maxBlockStart: VIEWPORT.height - oversizedSize.blockSize,
			minBlockEnd: 0,
			maxBlockEnd: VIEWPORT.height - APP_BAR_HEIGHT_PX - oversizedSize.blockSize,
		} );
	} );
} );
