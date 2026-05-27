import * as React from 'react';
import { useEffect, useRef } from 'react';
import { autoUpdate, FloatingPortal, offset, size, useFloating } from '@floating-ui/react';

import { useElementRect } from '../hooks/use-element-rect';
import { readGridTracks } from '../hooks/use-grid-tracks';
import type { ElementOverlayProps } from '../types/element-overlay';
import { CANVAS_WRAPPER_ID } from './outline-overlay';

const STROKE_COLOR = 'rgba(147, 0, 60, 0.5)';
const LINE_DASH: [ number, number ] = [ 4, 3 ];
const LINE_WIDTH = 1;
const PERF_LABEL = 'grid-outline:C';

function getHeapUsed(): number | null {
	const memory = ( performance as unknown as { memory?: { usedJSHeapSize: number } } ).memory;
	return memory ? memory.usedJSHeapSize : null;
}

export const GridOutlineOverlay = ( { element }: ElementOverlayProps ): React.ReactElement | null => {
	const canvasRef = useRef< HTMLCanvasElement | null >( null );
	const rect = useElementRect( element );
	const renderCountRef = useRef( 0 );
	const renderStartRef = useRef( 0 );
	const heapStartRef = useRef( 0 );

	const tracks = readGridTracks( element );
	const hasGrid = !! tracks;
	const shouldRender = hasGrid && element.isConnected && rect.width > 0 && rect.height > 0;

	if ( shouldRender ) {
		renderStartRef.current = performance.now();
		heapStartRef.current = getHeapUsed() ?? 0;
		performance.mark( `${ PERF_LABEL }:render-start` );
	}

	const { refs, floatingStyles } = useFloating( {
		open: true,
		whileElementsMounted: autoUpdate,
		middleware: [
			size( {
				apply( { elements, rects } ) {
					Object.assign( elements.floating.style, {
						width: `${ rects.reference.width }px`,
						height: `${ rects.reference.height }px`,
					} );
				},
			} ),
			offset( ( { rects } ) => -rects.reference.height / 2 - rects.floating.height / 2 ),
		],
	} );

	useEffect( () => {
		refs.setReference( element );
	}, [ element, refs ] );

	useEffect( () => {
		if ( ! shouldRender ) {
			return;
		}

		performance.mark( `${ PERF_LABEL }:render-end` );
		performance.measure(
			`${ PERF_LABEL }:render`,
			`${ PERF_LABEL }:render-start`,
			`${ PERF_LABEL }:render-end`
		);

		const duration = performance.now() - renderStartRef.current;
		const heapAfter = getHeapUsed();
		const heapDeltaKb =
			null !== heapAfter ? ( ( heapAfter - heapStartRef.current ) / 1024 ).toFixed( 2 ) : 'n/a';
		const heapTotalMb = null !== heapAfter ? ( heapAfter / 1024 / 1024 ).toFixed( 2 ) : 'n/a';
		const isInitial = 0 === renderCountRef.current;
		renderCountRef.current += 1;

		// eslint-disable-next-line no-console
		console.log(
			`[grid-outline][C] ${ isInitial ? 'initial render' : 're-render' }: ${ duration.toFixed( 2 ) }ms, heap Δ: ${ heapDeltaKb }KB, heap total: ${ heapTotalMb }MB`,
			{
				columns: tracks?.columns.length ?? 0,
				rows: tracks?.rows.length ?? 0,
				renderCount: renderCountRef.current,
			}
		);
	} );

	useEffect( () => {
		const canvas = canvasRef.current;

		if ( ! canvas || ! element.isConnected || rect.width <= 0 || rect.height <= 0 ) {
			return;
		}

		const draw = () => {
			performance.mark( `${ PERF_LABEL }:paint-start` );
			const paintStart = performance.now();
			paint( canvas, element, rect.width, rect.height );
			const paintDuration = performance.now() - paintStart;
			performance.mark( `${ PERF_LABEL }:paint-end` );
			performance.measure(
				`${ PERF_LABEL }:paint`,
				`${ PERF_LABEL }:paint-start`,
				`${ PERF_LABEL }:paint-end`
			);
			// eslint-disable-next-line no-console
			console.log(
				`[grid-outline][C] paint: ${ paintDuration.toFixed( 2 ) }ms`,
				{ canvasWidth: canvas.width, canvasHeight: canvas.height }
			);
		};

		draw();

		const doc = element.ownerDocument;
		const win = doc?.defaultView ?? window;
		const dpr = win.devicePixelRatio || 1;
		const mql = win.matchMedia( `(resolution: ${ dpr }dppx)` );
		const onDprChange = () => draw();

		mql.addEventListener( 'change', onDprChange );

		const styleObserver = doc?.head ? new MutationObserver( () => draw() ) : null;
		styleObserver?.observe( doc!.head, { childList: true, subtree: true, characterData: true } );

		return () => {
			mql.removeEventListener( 'change', onDprChange );
			styleObserver?.disconnect();
		};
	}, [ element, rect.width, rect.height ] );

	if ( ! shouldRender ) {
		return null;
	}

	return (
		<FloatingPortal id={ CANVAS_WRAPPER_ID }>
			<div
				ref={ refs.setFloating }
				style={ { ...floatingStyles, pointerEvents: 'none' } }
				data-grid-outline-overlay
				role="presentation"
			>
				<canvas
					ref={ canvasRef }
					style={ { display: 'block', width: '100%', height: '100%', pointerEvents: 'none' } }
				/>
			</div>
		</FloatingPortal>
	);
};

function paint( canvas: HTMLCanvasElement, element: HTMLElement, width: number, height: number ): void {
	const tracks = readGridTracks( element );

	const win = element.ownerDocument?.defaultView ?? window;
	const dpr = win.devicePixelRatio || 1;

	canvas.style.width = `${ width }px`;
	canvas.style.height = `${ height }px`;
	canvas.width = Math.round( width * dpr );
	canvas.height = Math.round( height * dpr );

	const ctx = canvas.getContext( '2d' );

	if ( ! ctx ) {
		return;
	}

	ctx.setTransform( dpr, 0, 0, dpr, 0, 0 );
	ctx.clearRect( 0, 0, width, height );

	if ( ! tracks ) {
		return;
	}

	ctx.strokeStyle = STROKE_COLOR;
	ctx.lineWidth = LINE_WIDTH;
	ctx.setLineDash( LINE_DASH );

	const { columns, rows, columnGap, rowGap, padding, offsetX, offsetY } = tracks;

	const contentLeft = offsetX + padding.left;
	const contentTop = offsetY + padding.top;
	const contentRight =
		offsetX +
		columns.reduce( ( sum, c ) => sum + c, 0 ) +
		columnGap * Math.max( columns.length - 1, 0 ) +
		padding.left;
	const contentBottom =
		offsetY + rows.reduce( ( sum, r ) => sum + r, 0 ) + rowGap * Math.max( rows.length - 1, 0 ) + padding.top;

	let x = contentLeft;
	for ( let i = 0; i < columns.length; i++ ) {
		if ( i > 0 ) {
			drawVerticalLine( ctx, x, contentTop, contentBottom );
		}
		x += columns[ i ];
		if ( i < columns.length - 1 ) {
			if ( columnGap > 0 ) {
				drawVerticalLine( ctx, x, contentTop, contentBottom );
				x += columnGap;
			}
		}
	}

	let y = contentTop;
	for ( let i = 0; i < rows.length; i++ ) {
		if ( i > 0 ) {
			drawHorizontalLine( ctx, y, contentLeft, contentRight );
		}
		y += rows[ i ];
		if ( i < rows.length - 1 ) {
			if ( rowGap > 0 ) {
				drawHorizontalLine( ctx, y, contentLeft, contentRight );
				y += rowGap;
			}
		}
	}

	ctx.strokeRect(
		snap( contentLeft ),
		snap( contentTop ),
		Math.round( contentRight - contentLeft ),
		Math.round( contentBottom - contentTop )
	);
}

function drawVerticalLine( ctx: CanvasRenderingContext2D, x: number, top: number, bottom: number ): void {
	const sx = snap( x );
	ctx.beginPath();
	ctx.moveTo( sx, snap( top ) );
	ctx.lineTo( sx, snap( bottom ) );
	ctx.stroke();
}

function drawHorizontalLine( ctx: CanvasRenderingContext2D, y: number, left: number, right: number ): void {
	const sy = snap( y );
	ctx.beginPath();
	ctx.moveTo( snap( left ), sy );
	ctx.lineTo( snap( right ), sy );
	ctx.stroke();
}

function snap( v: number ): number {
	return Math.round( v ) + 0.5;
}
