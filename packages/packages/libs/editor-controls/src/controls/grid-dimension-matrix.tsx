import * as React from 'react';
import { useCallback, useRef, useState } from 'react';
import { Box } from '@elementor/ui';
import { __, sprintf } from '@wordpress/i18n';

import {
	GRID_MATRIX_MAX_COLUMNS,
	GRID_MATRIX_MAX_ROWS,
	countsFromMatrixCell,
	isMatrixCellActive,
} from './grid-dimension-utils';

const MATRIX_LABEL = __( 'Grid dimensions', 'elementor' );
const CELL_LABEL = __( 'Column %s, row %s', 'elementor' );

type GridDimensionMatrixProps = {
	columns: number;
	rows: number;
	onSelect: ( columns: number, rows: number ) => void;
	disabled?: boolean;
};

const cols = GRID_MATRIX_MAX_COLUMNS;
const rows = GRID_MATRIX_MAX_ROWS;

export const GridDimensionMatrix = ( {
	columns,
	rows: rowCount,
	onSelect,
	disabled = false,
}: GridDimensionMatrixProps ) => {
	const buttonsRef = useRef<( HTMLButtonElement | null )[]>( [] );
	const [ focusCol, setFocusCol ] = useState( 0 );
	const [ focusRow, setFocusRow ] = useState( 0 );

	const focusButton = useCallback( ( col: number, row: number ) => {
		const c = Math.max( 0, Math.min( cols - 1, col ) );
		const r = Math.max( 0, Math.min( rows - 1, row ) );
		setFocusCol( c );
		setFocusRow( r );
		const idx = r * cols + c;
		queueMicrotask( () => buttonsRef.current[ idx ]?.focus() );
	}, [] );

	const onMatrixKeyDown = useCallback(
		( event: React.KeyboardEvent ) => {
			if ( disabled ) {
				return;
			}
			let { col, row } = { col: focusCol, row: focusRow };
			switch ( event.key ) {
				case 'ArrowRight':
					col = Math.min( cols - 1, col + 1 );
					break;
				case 'ArrowLeft':
					col = Math.max( 0, col - 1 );
					break;
				case 'ArrowDown':
					row = Math.min( rows - 1, row + 1 );
					break;
				case 'ArrowUp':
					row = Math.max( 0, row - 1 );
					break;
				case 'Home':
					col = 0;
					break;
				case 'End':
					col = cols - 1;
					break;
				case 'PageDown':
					row = rows - 1;
					break;
				case 'PageUp':
					row = 0;
					break;
				case 'Enter':
				case ' ':
					event.preventDefault();
					{
						const picked = countsFromMatrixCell( col, row );
						onSelect( picked.columns, picked.rows );
					}
					return;
				default:
					return;
			}
			event.preventDefault();
			focusButton( col, row );
		},
		[ disabled, focusButton, focusCol, focusRow, onSelect ]
	);

	const cells: React.ReactNode[] = [];
	for ( let r = 0; r < rows; r++ ) {
		for ( let c = 0; c < cols; c++ ) {
			const idx = r * cols + c;
			const active = isMatrixCellActive( c, r, columns, rowCount );
			const isFocusedCell = c === focusCol && r === focusRow;
			const label = sprintf( CELL_LABEL, String( c + 1 ), String( r + 1 ) );

			cells.push(
				<Box
					component="button"
					type="button"
					key={ `g-${ r }-${ c }` }
					ref={ ( el ) => {
						buttonsRef.current[ idx ] = el;
					} }
					role="gridcell"
					tabIndex={ isFocusedCell && ! disabled ? 0 : -1 }
					disabled={ disabled }
					aria-selected={ active }
					aria-label={ label }
					onFocus={ () => {
						setFocusCol( c );
						setFocusRow( r );
					} }
					onClick={ () => {
						if ( disabled ) {
							return;
						}
						const next = countsFromMatrixCell( c, r );
						onSelect( next.columns, next.rows );
						setFocusCol( c );
						setFocusRow( r );
					} }
					onKeyDown={ onMatrixKeyDown }
					sx={ {
						m: 0.125,
						minWidth: 0,
						minHeight: 0,
						aspectRatio: '1',
						p: 0,
						border: '1px solid',
						borderColor: active ? 'primary.main' : 'divider',
						borderRadius: 0.5,
						bgcolor: active ? 'primary.light' : 'action.hover',
						cursor: disabled ? 'default' : 'pointer',
						opacity: disabled ? 0.5 : 1,
						'&:focus-visible': {
							outline: '2px solid',
							outlineColor: 'primary.main',
							outlineOffset: 1,
						},
					} }
				/>
			);
		}
	}

	return (
		<Box
			role="grid"
			aria-label={ MATRIX_LABEL }
			aria-rowcount={ rows }
			aria-colcount={ cols }
			sx={ {
				display: 'grid',
				gridTemplateColumns: `repeat(${ cols }, minmax(0, 1fr))`,
				width: '100%',
			} }
		>
			{ cells }
		</Box>
	);
};
