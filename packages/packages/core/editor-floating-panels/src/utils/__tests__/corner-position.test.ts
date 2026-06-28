import type { LogicalPosition, LogicalSize } from '../../types';
import {
	buildInitialPosition,
	fromStartAnchoredPosition,
	getActiveInsetKeys,
	type PanelCorner,
	positionToCssInsets,
	toStartAnchoredPosition,
} from '../corner-position';

const VIEWPORT = { width: 1200, height: 900 };
const SIZE: LogicalSize = { inlineSize: 320, blockSize: 480 };

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
} );
