/** Min/max for grid column and row counts (atomic grid prop). */
export const GRID_DIMENSION_MIN = 1;
export const GRID_DIMENSION_MAX = 24;

/** Interactive picker matrix size (Figma-style); counts may still go up to GRID_DIMENSION_MAX via inputs. */
export const GRID_MATRIX_MAX_COLUMNS = 10;
export const GRID_MATRIX_MAX_ROWS = 8;

export function clampGridDimension( value: number ): number {
	return Math.max( GRID_DIMENSION_MIN, Math.min( GRID_DIMENSION_MAX, value ) );
}

/**
 * Parses a numeric grid dimension from editor state with clamping.
 * Non-finite values fall back to `fallback` (also clamped).
 */
export function parseClampedGridDimension( value: unknown, fallback: number ): number {
	const base =
		typeof value === 'number' && Number.isFinite( value ) ? value : fallback;
	return clampGridDimension( base );
}

/**
 * Whether the matrix cell at (0-based indices) lies inside the active columns × rows region.
 */
export function isMatrixCellActive(
	columnIndex: number,
	rowIndex: number,
	columns: number,
	rows: number
): boolean {
	return columnIndex < columns && rowIndex < rows;
}

/**
 * Column/row counts when the user picks the cell at `columnIndex` × `rowIndex` (0-based, top-left origin).
 */
export function countsFromMatrixCell( columnIndex: number, rowIndex: number ): {
	columns: number;
	rows: number;
} {
	return {
		columns: clampGridDimension( columnIndex + 1 ),
		rows: clampGridDimension( rowIndex + 1 ),
	};
}
