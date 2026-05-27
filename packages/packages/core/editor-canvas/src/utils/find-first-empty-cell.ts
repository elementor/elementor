export type GridCell = { column: number; row: number };

type Placement = {
	colStart: number | 'auto';
	colEnd: number | 'auto';
	colSpan: number;
	rowStart: number | 'auto';
	rowEnd: number | 'auto';
	rowSpan: number;
};

function parseLine( value: string | undefined ): number | 'auto' {
	if ( ! value || value === 'auto' ) {
		return 'auto';
	}
	const span = value.match( /^span\s+(\d+)/i );
	if ( span ) {
		return 'auto';
	}
	const parsed = parseInt( value, 10 );
	return Number.isFinite( parsed ) ? parsed : 'auto';
}

function parseSpan( startValue: string | undefined, endValue: string | undefined ): number {
	const endSpan = endValue?.match( /^span\s+(\d+)/i );
	if ( endSpan ) {
		return Math.max( 1, parseInt( endSpan[ 1 ], 10 ) );
	}
	const startSpan = startValue?.match( /^span\s+(\d+)/i );
	if ( startSpan ) {
		return Math.max( 1, parseInt( startSpan[ 1 ], 10 ) );
	}
	const start = parseLine( startValue );
	const end = parseLine( endValue );
	if ( typeof start === 'number' && typeof end === 'number' ) {
		return Math.max( 1, end - start );
	}
	return 1;
}

function getPlacement( child: HTMLElement ): Placement {
	const cs = getComputedStyle( child );
	return {
		colStart: parseLine( cs.gridColumnStart ),
		colEnd: parseLine( cs.gridColumnEnd ),
		colSpan: parseSpan( cs.gridColumnStart, cs.gridColumnEnd ),
		rowStart: parseLine( cs.gridRowStart ),
		rowEnd: parseLine( cs.gridRowEnd ),
		rowSpan: parseSpan( cs.gridRowStart, cs.gridRowEnd ),
	};
}

function markOccupied(
	matrix: boolean[][],
	rows: number,
	columns: number,
	row: number,
	column: number,
	rowSpan: number,
	colSpan: number
) {
	for ( let r = row; r < Math.min( rows, row + rowSpan ); r++ ) {
		for ( let c = column; c < Math.min( columns, column + colSpan ); c++ ) {
			matrix[ r ][ c ] = true;
		}
	}
}

function findNextAutoCell(
	matrix: boolean[][],
	rows: number,
	columns: number,
	flow: 'row' | 'column',
	rowSpan: number,
	colSpan: number,
	cursor: { row: number; column: number }
): { row: number; column: number } | null {
	if ( flow === 'row' ) {
		for ( let r = cursor.row; r < rows; r++ ) {
			const startC = r === cursor.row ? cursor.column : 0;
			for ( let c = startC; c <= columns - colSpan; c++ ) {
				if ( ! isOccupied( matrix, r, c, rowSpan, colSpan, rows, columns ) ) {
					return { row: r, column: c };
				}
			}
		}
		return null;
	}
	for ( let c = cursor.column; c < columns; c++ ) {
		const startR = c === cursor.column ? cursor.row : 0;
		for ( let r = startR; r <= rows - rowSpan; r++ ) {
			if ( ! isOccupied( matrix, r, c, rowSpan, colSpan, rows, columns ) ) {
				return { row: r, column: c };
			}
		}
	}
	return null;
}

function isOccupied(
	matrix: boolean[][],
	row: number,
	column: number,
	rowSpan: number,
	colSpan: number,
	rows: number,
	columns: number
): boolean {
	if ( row + rowSpan > rows || column + colSpan > columns ) {
		return true;
	}
	for ( let r = row; r < row + rowSpan; r++ ) {
		for ( let c = column; c < column + colSpan; c++ ) {
			if ( matrix[ r ][ c ] ) {
				return true;
			}
		}
	}
	return false;
}

export function findFirstEmptyCell(
	element: HTMLElement | null,
	columns: number,
	rows: number,
	flow: 'row' | 'column' = 'row'
): GridCell | null {
	if ( ! element || columns === 0 || rows === 0 ) {
		return null;
	}

	const matrix: boolean[][] = Array.from( { length: rows }, () => Array( columns ).fill( false ) );
	const cursor = { row: 0, column: 0 };

	for ( const child of Array.from( element.children ) as HTMLElement[] ) {
		if ( ! child.isConnected ) {
			continue;
		}
		const cs = getComputedStyle( child );
		if ( cs.display === 'none' ) {
			continue;
		}

		const placement = getPlacement( child );
		const explicitColumn = typeof placement.colStart === 'number' ? placement.colStart - 1 : null;
		const explicitRow = typeof placement.rowStart === 'number' ? placement.rowStart - 1 : null;

		if ( explicitColumn !== null && explicitRow !== null ) {
			markOccupied( matrix, rows, columns, explicitRow, explicitColumn, placement.rowSpan, placement.colSpan );
			continue;
		}

		const next = findNextAutoCell( matrix, rows, columns, flow, placement.rowSpan, placement.colSpan, cursor );
		if ( ! next ) {
			continue;
		}
		markOccupied( matrix, rows, columns, next.row, next.column, placement.rowSpan, placement.colSpan );
		if ( flow === 'row' ) {
			cursor.row = next.row;
			cursor.column = next.column + placement.colSpan;
			if ( cursor.column >= columns ) {
				cursor.row += 1;
				cursor.column = 0;
			}
		} else {
			cursor.column = next.column;
			cursor.row = next.row + placement.rowSpan;
			if ( cursor.row >= rows ) {
				cursor.column += 1;
				cursor.row = 0;
			}
		}
	}

	for ( let r = 0; r < rows; r++ ) {
		for ( let c = 0; c < columns; c++ ) {
			const row = flow === 'row' ? r : c;
			const column = flow === 'row' ? c : r;
			if ( row >= rows || column >= columns ) {
				continue;
			}
			if ( ! matrix[ row ][ column ] ) {
				return { row, column };
			}
		}
	}
	return null;
}
