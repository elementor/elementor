import * as React from 'react';
import { useMemo } from 'react';
import { getElementEditorSettings } from '@elementor/editor-elements';
import { __privateUseListenTo as useListenTo, windowEvent } from '@elementor/editor-v1-adapters';
import { Box } from '@elementor/ui';
import { FloatingPortal } from '@floating-ui/react';

import { useElementRect } from '../hooks/use-element-rect';
import { useFloatingOnElement } from '../hooks/use-floating-on-element';
import { type GridTracks, useGridTracks } from '../hooks/use-grid-tracks';
import type { ElementOverlayProps } from '../types/element-overlay';
import { findFirstEmptyCell, type GridCell } from '../utils/find-first-empty-cell';
import { CANVAS_WRAPPER_ID } from './outline-overlay';

const STROKE = 'rgba(192, 132, 252, 0.9)';
const DASH = '4 4';

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

function getFlowDirection( element: HTMLElement ): 'row' | 'column' {
	const flow = getComputedStyle( element ).gridAutoFlow || 'row';
	return flow.includes( 'column' ) ? 'column' : 'row';
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
	width: number;
	height: number;
	tracks: GridTracks;
};

const GridOutlineSvg = ( { width, height, tracks }: SvgProps ) => {
	const xPositions = useMemo( () => cumulative( tracks.columns, tracks.columnGap, tracks.padding.left ), [ tracks ] );
	const yPositions = useMemo( () => cumulative( tracks.rows, tracks.rowGap, tracks.padding.top ), [ tracks ] );

	const lines: React.ReactElement[] = [];
	xPositions.forEach( ( x, index ) => {
		lines.push(
			<line
				key={ `v-${ index }` }
				x1={ x }
				x2={ x }
				y1={ tracks.padding.top }
				y2={ height - tracks.padding.bottom }
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
				x2={ width - tracks.padding.right }
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
			width={ width }
			height={ height }
			viewBox={ `0 0 ${ width } ${ height }` }
			style={ { position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' } }
			role="presentation"
		>
			{ lines }
		</svg>
	);
};

function cellCenter( cell: GridCell, tracks: GridTracks ): { x: number; y: number } | null {
	if ( cell.column >= tracks.columns.length || cell.row >= tracks.rows.length ) {
		return null;
	}
	const colStart =
		tracks.padding.left +
		tracks.columns.slice( 0, cell.column ).reduce( ( sum, w ) => sum + w, 0 ) +
		tracks.columnGap * cell.column;
	const rowStart =
		tracks.padding.top +
		tracks.rows.slice( 0, cell.row ).reduce( ( sum, h ) => sum + h, 0 ) +
		tracks.rowGap * cell.row;
	return {
		x: colStart + tracks.columns[ cell.column ] / 2,
		y: rowStart + tracks.rows[ cell.row ] / 2,
	};
}

type PlusProps = { center: { x: number; y: number } };

const FirstEmptyCellPlus = ( { center }: PlusProps ) => (
	<Box
		aria-hidden
		sx={ {
			position: 'absolute',
			left: center.x,
			top: center.y,
			width: 24,
			height: 24,
			marginLeft: '-12px',
			marginTop: '-12px',
			borderRadius: '50%',
			backgroundColor: 'rgba(192, 132, 252, 0.15)',
			color: 'rgba(124, 58, 237, 1)',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			fontSize: 18,
			lineHeight: 1,
			pointerEvents: 'none',
		} }
	>
		+
	</Box>
);

export const GridOutlineOverlay = ( { element, id, isSelected }: ElementOverlayProps ): React.ReactElement | null => {
	const enabled = useGridOutlineEnabled( id );
	const rect = useElementRect( element );
	const tracks = useGridTracks( element, rect );
	const { floating, isVisible } = useFloatingOnElement( { element, isSelected: true } );

	const firstEmpty = useMemo( () => {
		if ( tracks.columns.length === 0 || tracks.rows.length === 0 ) {
			return null;
		}
		return findFirstEmptyCell( element, tracks.columns.length, tracks.rows.length, getFlowDirection( element ) );
		// rect dimensions trigger recompute on element resize / drag-in events that don't change track counts.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ element, tracks.columns.length, tracks.rows.length, rect.width, rect.height ] );

	void isSelected;

	if ( ! enabled || ! isVisible || tracks.columns.length === 0 || tracks.rows.length === 0 ) {
		return null;
	}

	const center = firstEmpty ? cellCenter( firstEmpty, tracks ) : null;

	return (
		<FloatingPortal id={ CANVAS_WRAPPER_ID }>
			<Box
				ref={ floating.setRef }
				data-grid-outline={ id }
				role="presentation"
				style={ { ...floating.styles, pointerEvents: 'none' } }
			>
				<GridOutlineSvg width={ rect.width } height={ rect.height } tracks={ tracks } />
				{ center && <FirstEmptyCellPlus center={ center } /> }
			</Box>
		</FloatingPortal>
	);
};
