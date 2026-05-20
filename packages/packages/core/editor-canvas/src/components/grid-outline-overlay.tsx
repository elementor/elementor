import * as React from 'react';
import { useEffect, useMemo, useRef } from 'react';
import { getElementEditorSettings } from '@elementor/editor-elements';
import { __privateUseListenTo as useListenTo, windowEvent } from '@elementor/editor-v1-adapters';
import { Box } from '@elementor/ui';
import { FloatingPortal } from '@floating-ui/react';

import { useFloatingOnElement } from '../hooks/use-floating-on-element';
import { type GridTracks, useGridTracks } from '../hooks/use-grid-tracks';
import type { ElementOverlayProps } from '../types/element-overlay';
import { CANVAS_WRAPPER_ID } from './outline-overlay';

const STROKE = 'rgba(192, 132, 252, 0.9)';
const DASH = '4 4';
const PERF_LABEL = 'grid-outline:A';

function getHeapUsed(): number | null {
	const memory = ( performance as unknown as { memory?: { usedJSHeapSize: number } } ).memory;
	return memory ? memory.usedJSHeapSize : null;
}

function useGridOutlineEnabled( id: string ): boolean {
	return useListenTo(
		windowEvent( 'elementor/element/update_editor_settings' ),
		() => {
			const settings = getElementEditorSettings( id ) as { grid_outline?: boolean } | undefined;
			return settings?.grid_outline !== false;
		},
		[ id ]
	);
}

function cumulative( sizes: number[], gap: number, leadingOffset: number ): number[] {
	const positions: number[] = [];
	let cursor = leadingOffset;
	sizes.forEach( ( size, index ) => {
		positions.push( cursor );
		cursor += size;
		positions.push( cursor );
		if ( index < sizes.length - 1 ) {
			cursor += gap;
		}
	} );
	return positions;
}

type SvgProps = {
	tracks: GridTracks;
};

const GridOutlineSvg = ( { tracks }: SvgProps ) => {
	const xPositions = useMemo( () => cumulative( tracks.columns, tracks.columnGap, tracks.padding.left ), [ tracks ] );
	const yPositions = useMemo( () => cumulative( tracks.rows, tracks.rowGap, tracks.padding.top ), [ tracks ] );

	const totalWidth =
		tracks.padding.left +
		tracks.padding.right +
		tracks.columns.reduce( ( sum, w ) => sum + w, 0 ) +
		tracks.columnGap * Math.max( 0, tracks.columns.length - 1 );
	const totalHeight =
		tracks.padding.top +
		tracks.padding.bottom +
		tracks.rows.reduce( ( sum, h ) => sum + h, 0 ) +
		tracks.rowGap * Math.max( 0, tracks.rows.length - 1 );

	const lines: React.ReactElement[] = [];
	xPositions.forEach( ( x, index ) => {
		lines.push(
			<line
				key={ `v-${ index }` }
				x1={ x }
				x2={ x }
				y1={ tracks.padding.top }
				y2={ totalHeight - tracks.padding.bottom }
				stroke={ STROKE }
				strokeWidth={ 1 }
				strokeDasharray={ DASH }
				vectorEffect="non-scaling-stroke"
			/>
		);
	} );
	yPositions.forEach( ( y, index ) => {
		lines.push(
			<line
				key={ `h-${ index }` }
				x1={ tracks.padding.left }
				x2={ totalWidth - tracks.padding.right }
				y1={ y }
				y2={ y }
				stroke={ STROKE }
				strokeWidth={ 1 }
				strokeDasharray={ DASH }
				vectorEffect="non-scaling-stroke"
			/>
		);
	} );

	return (
		<svg
			width={ totalWidth }
			height={ totalHeight }
			viewBox={ `0 0 ${ totalWidth } ${ totalHeight }` }
			style={ { position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' } }
			role="presentation"
		>
			{ lines }
		</svg>
	);
};

export const GridOutlineOverlay = ( { element, id, isSelected }: ElementOverlayProps ): React.ReactElement | null => {
	const enabled = useGridOutlineEnabled( id );
	const tracks = useGridTracks( element );
	const { floating, isVisible } = useFloatingOnElement( { element, isSelected: true } );

	void isSelected;

	const shouldRender = enabled && isVisible && tracks.columns.length > 0 && tracks.rows.length > 0;

	const renderCountRef = useRef( 0 );
	const renderStartRef = useRef( 0 );
	const heapStartRef = useRef( 0 );

	if ( shouldRender ) {
		renderStartRef.current = performance.now();
		heapStartRef.current = getHeapUsed() ?? 0;
		performance.mark( `${ PERF_LABEL }:render-start` );
	}

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
			`[grid-outline][A] ${ isInitial ? 'initial render' : 're-render' }: ${ duration.toFixed( 2 ) }ms, heap Δ: ${ heapDeltaKb }KB, heap total: ${ heapTotalMb }MB`,
			{
				columns: tracks.columns.length,
				rows: tracks.rows.length,
				renderCount: renderCountRef.current,
			}
		);
	} );

	if ( ! shouldRender ) {
		return null;
	}

	return (
		<FloatingPortal id={ CANVAS_WRAPPER_ID }>
			<Box
				ref={ floating.setRef }
				data-grid-outline={ id }
				role="presentation"
				style={ { ...floating.styles, pointerEvents: 'none' } }
			>
				<GridOutlineSvg tracks={ tracks } />
			</Box>
		</FloatingPortal>
	);
};
