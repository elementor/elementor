import {
	gridTrackSizePropTypeUtil,
	type GridTrackSizePropValue,
	type PropValue,
	stringPropTypeUtil,
} from '@elementor/editor-props';

export type GridTrackUnit = 'fr' | 'custom';

export type GridTrackValue = { kind: 'empty' } | { kind: 'fr'; count: number } | { kind: 'custom'; raw: string };

export const FR = 'fr' as const;
export const CUSTOM = 'custom' as const;
export const UNITS: GridTrackUnit[] = [ FR, CUSTOM ];

export const EMPTY: GridTrackValue = { kind: 'empty' };

// Backward-compat: legacy values were stored as `{$$type:'string', value:'repeat(N, 1fr)'}`.
const REPEAT_FR_PATTERN = /^repeat\(\s*(\d+)\s*,\s*1fr\s*\)$/;

const parseString = ( css: string | null ): GridTrackValue => {
	if ( ! css ) {
		return EMPTY;
	}
	const match = css.match( REPEAT_FR_PATTERN );
	if ( match ) {
		const count = parseInt( match[ 1 ], 10 );
		return count >= 1 ? { kind: 'fr', count } : EMPTY;
	}
	return { kind: 'custom', raw: css };
};

const parseGridTrackSize = ( size: GridTrackSizePropValue[ 'value' ] | null ): GridTrackValue => {
	if ( ! size ) {
		return EMPTY;
	}
	if ( size.unit === FR ) {
		const n = Number( size.size );
		return Number.isFinite( n ) && n >= 1 ? { kind: 'fr', count: Math.trunc( n ) } : EMPTY;
	}
	const raw = String( size.size ?? '' );
	return raw === '' ? EMPTY : { kind: 'custom', raw };
};

export const parseValue = ( value: PropValue | undefined | null ): GridTrackValue => {
	if ( ! value ) {
		return EMPTY;
	}
	if ( gridTrackSizePropTypeUtil.isValid( value ) ) {
		return parseGridTrackSize( gridTrackSizePropTypeUtil.extract( value ) );
	}
	if ( stringPropTypeUtil.isValid( value ) ) {
		return parseString( stringPropTypeUtil.extract( value ) );
	}
	return EMPTY;
};

export const fromSizeInput = ( v: { size: number | string; unit: GridTrackUnit } ): GridTrackValue => {
	if ( v.size === '' || Number.isNaN( v.size ) ) {
		return EMPTY;
	}
	if ( v.unit === FR ) {
		const n = Number( v.size );
		return Number.isFinite( n ) && n >= 1 ? { kind: 'fr', count: Math.trunc( n ) } : EMPTY;
	}
	return { kind: 'custom', raw: String( v.size ) };
};

export const toPropValue = ( v: GridTrackValue ): PropValue => {
	switch ( v.kind ) {
		case 'empty':
			return null;
		case 'fr':
			return gridTrackSizePropTypeUtil.create( { size: v.count, unit: FR } );
		case 'custom':
			return gridTrackSizePropTypeUtil.create( { size: v.raw, unit: CUSTOM } );
	}
};

export const toSizeInput = (
	v: GridTrackValue,
	fallbackUnit: GridTrackUnit = FR
): { size: number | string; unit: GridTrackUnit } => {
	switch ( v.kind ) {
		case 'empty':
			return { size: '', unit: fallbackUnit };
		case 'fr':
			return { size: v.count, unit: FR };
		case 'custom':
			return { size: v.raw, unit: CUSTOM };
	}
};

export const toPlaceholder = ( v: GridTrackValue ): string | undefined => {
	switch ( v.kind ) {
		case 'empty':
			return undefined;
		case 'fr':
			return String( v.count );
		case 'custom':
			return v.raw;
	}
};

export const unitOf = ( v: GridTrackValue, fallback: GridTrackUnit = FR ): GridTrackUnit => {
	if ( v.kind === 'fr' ) {
		return FR;
	}
	if ( v.kind === 'custom' ) {
		return CUSTOM;
	}
	return fallback;
};
