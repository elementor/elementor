export type EmptyCell = {
	row: number;
	col: number;
};

type LineValue = 'auto' | number | { kind: 'span'; n: number };

type ResolvedPlacement = {
	start: number | null;
	span: number;
};

export function findFirstEmptyCell(
	element: HTMLElement | null,
	columnCount: number,
	rowCount: number
): EmptyCell | null {
	if ( ! element || columnCount === 0 || rowCount === 0 ) {
		return null;
	}

	const previewWindow = element.ownerDocument?.defaultView;

	if ( ! previewWindow ) {
		return null;
	}

	const containerStyle = previewWindow.getComputedStyle( element );
	const flowsByColumn = containerStyle.gridAutoFlow.trim().startsWith( 'column' );

	const matrix: boolean[][] = Array.from( { length: rowCount }, () => new Array( columnCount ).fill( false ) );

	const explicit: Array< { col: number | null; colSpan: number; row: number | null; rowSpan: number } > = [];
	const autoPlaced: Array< { colSpan: number; rowSpan: number } > = [];

	for ( const child of Array.from( element.children ) ) {
		if ( ! child.classList.contains( 'elementor-element' ) ) {
			continue;
		}

		const style = previewWindow.getComputedStyle( child );

		if ( style.display === 'none' ) {
			continue;
		}

		const col = resolvePlacement( style.gridColumnStart, style.gridColumnEnd );
		const row = resolvePlacement( style.gridRowStart, style.gridRowEnd );

		if ( col.start !== null || row.start !== null ) {
			explicit.push( { col: col.start, colSpan: col.span, row: row.start, rowSpan: row.span } );
		} else {
			autoPlaced.push( { colSpan: col.span, rowSpan: row.span } );
		}
	}

	for ( const child of explicit ) {
		fillMatrix( matrix, child.col ?? 0, child.row ?? 0, child.colSpan, child.rowSpan );
	}

	for ( const child of autoPlaced ) {
		const slot = findNextFreeSlot( matrix, child.colSpan, child.rowSpan, flowsByColumn );

		if ( slot ) {
			fillMatrix( matrix, slot.col, slot.row, child.colSpan, child.rowSpan );
		}
	}

	return scanFirstEmpty( matrix, flowsByColumn );
}

function resolvePlacement( startRaw: string, endRaw: string ): ResolvedPlacement {
	const start = parseLineValue( startRaw );
	const end = parseLineValue( endRaw );

	if ( typeof start === 'number' ) {
		const zeroIndexedStart = start - 1;

		if ( typeof end === 'number' ) {
			return { start: zeroIndexedStart, span: Math.max( 1, end - start ) };
		}

		if ( isSpan( end ) ) {
			return { start: zeroIndexedStart, span: end.n };
		}

		return { start: zeroIndexedStart, span: 1 };
	}

	if ( isSpan( start ) ) {
		if ( typeof end === 'number' ) {
			const zeroIndexedStart = end - 1 - start.n;
			return { start: zeroIndexedStart >= 0 ? zeroIndexedStart : null, span: start.n };
		}

		return { start: null, span: start.n };
	}

	if ( typeof end === 'number' ) {
		const zeroIndexedStart = end - 2;
		return { start: zeroIndexedStart >= 0 ? zeroIndexedStart : null, span: 1 };
	}

	if ( isSpan( end ) ) {
		return { start: null, span: end.n };
	}

	return { start: null, span: 1 };
}

function parseLineValue( raw: string ): LineValue {
	const trimmed = raw.trim();

	if ( trimmed === '' || trimmed === 'auto' ) {
		return 'auto';
	}

	const spanMatch = trimmed.match( /^span\s+(\d+)$/ );

	if ( spanMatch ) {
		const n = parseInt( spanMatch[ 1 ], 10 );
		return { kind: 'span', n: Math.max( 1, n ) };
	}

	const parsed = parseInt( trimmed, 10 );

	if ( Number.isFinite( parsed ) && parsed > 0 ) {
		return parsed;
	}

	return 'auto';
}

function isSpan( value: LineValue ): value is { kind: 'span'; n: number } {
	return typeof value === 'object' && value !== null && 'kind' in value && value.kind === 'span';
}

function fillMatrix( matrix: boolean[][], col: number, row: number, colSpan: number, rowSpan: number ): void {
	const rows = matrix.length;
	const cols = rows > 0 ? matrix[ 0 ].length : 0;

	const startRow = Math.max( 0, row );
	const startCol = Math.max( 0, col );
	const endRow = Math.min( rows, row + rowSpan );
	const endCol = Math.min( cols, col + colSpan );

	for ( let r = startRow; r < endRow; r++ ) {
		for ( let c = startCol; c < endCol; c++ ) {
			matrix[ r ][ c ] = true;
		}
	}
}

function findNextFreeSlot(
	matrix: boolean[][],
	colSpan: number,
	rowSpan: number,
	flowsByColumn: boolean
): EmptyCell | null {
	const rows = matrix.length;
	const cols = rows > 0 ? matrix[ 0 ].length : 0;

	const maxCol = cols - colSpan;
	const maxRow = rows - rowSpan;

	if ( maxCol < 0 || maxRow < 0 ) {
		return null;
	}

	if ( flowsByColumn ) {
		for ( let col = 0; col <= maxCol; col++ ) {
			for ( let row = 0; row <= maxRow; row++ ) {
				if ( canFit( matrix, col, row, colSpan, rowSpan ) ) {
					return { row, col };
				}
			}
		}
	} else {
		for ( let row = 0; row <= maxRow; row++ ) {
			for ( let col = 0; col <= maxCol; col++ ) {
				if ( canFit( matrix, col, row, colSpan, rowSpan ) ) {
					return { row, col };
				}
			}
		}
	}

	return null;
}

function canFit( matrix: boolean[][], col: number, row: number, colSpan: number, rowSpan: number ): boolean {
	for ( let r = row; r < row + rowSpan; r++ ) {
		for ( let c = col; c < col + colSpan; c++ ) {
			if ( matrix[ r ][ c ] ) {
				return false;
			}
		}
	}

	return true;
}

function scanFirstEmpty( matrix: boolean[][], flowsByColumn: boolean ): EmptyCell | null {
	const rows = matrix.length;
	const cols = rows > 0 ? matrix[ 0 ].length : 0;

	if ( flowsByColumn ) {
		for ( let col = 0; col < cols; col++ ) {
			for ( let row = 0; row < rows; row++ ) {
				if ( ! matrix[ row ][ col ] ) {
					return { row, col };
				}
			}
		}
	} else {
		for ( let row = 0; row < rows; row++ ) {
			for ( let col = 0; col < cols; col++ ) {
				if ( ! matrix[ row ][ col ] ) {
					return { row, col };
				}
			}
		}
	}

	return null;
}
