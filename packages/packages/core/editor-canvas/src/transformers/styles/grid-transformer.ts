import { createMultiPropsValue } from '../../renderers/multi-props';
import { createTransformer } from '../create-transformer';

type GridValue = {
	columnsCount?: number | null;
	rowsCount?: number | null;
	columnsTemplate?: string | null;
	rowsTemplate?: string | null;
	columnGap?: string | null;
	rowGap?: string | null;
	autoFlow?: string | null;
};

const ALLOWED_FLOW = [ 'row', 'column', 'dense', 'row dense', 'column dense' ] as const;

export const gridTransformer = createTransformer( ( value: GridValue ) => {
	const colCount = Number( value.columnsCount ?? 3 );
	const rowCount = Number( value.rowsCount ?? 2 );
	const columns = Number.isFinite( colCount ) && colCount >= 1 ? Math.floor( colCount ) : 3;
	const rows = Number.isFinite( rowCount ) && rowCount >= 1 ? Math.floor( rowCount ) : 2;

	const columnsTemplate = String( value.columnsTemplate ?? '' ).trim();
	const rowsTemplate = String( value.rowsTemplate ?? '' ).trim();

	const colCss = columnsTemplate !== '' ? columnsTemplate : `repeat(${ columns }, 1fr)`;
	const rowCss = rowsTemplate !== '' ? rowsTemplate : `repeat(${ rows }, 1fr)`;

	const out: Record< string, string > = {
		'grid-template-columns': colCss,
		'grid-template-rows': rowCss,
	};

	const columnGap = value.columnGap;
	const rowGap = value.rowGap;

	if ( columnGap != null && columnGap !== '' ) {
		out[ 'column-gap' ] = columnGap;
	}
	if ( rowGap != null && rowGap !== '' ) {
		out[ 'row-gap' ] = rowGap;
	}

	const flow = String( value.autoFlow ?? 'row' ).trim();
	out[ 'grid-auto-flow' ] = ( ALLOWED_FLOW as readonly string[] ).includes( flow ) ? flow : 'row';

	return createMultiPropsValue( out );
} );
