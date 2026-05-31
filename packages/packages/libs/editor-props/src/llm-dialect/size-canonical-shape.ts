import { numberPropTypeUtil, stringPropTypeUtil } from '../prop-types';
import { type PropValue, type TransformablePropValue } from '../types';

type SizePropValue = TransformablePropValue<
	'size',
	{
		size: PropValue | string | number | null;
		unit: PropValue | string;
	}
>;

type CanonicalSizeValue = {
	unit: string;
	size: string | number | null;
};

type SizeInnerValue = SizePropValue[ 'value' ];

const DEFAULT_SIZE_UNIT = 'px';

const ensureNotNull = < T >( value: T | null | undefined, fallback: T ): T =>
	value === null || value === undefined ? fallback : value;

const isTransformablePropValue = ( value: unknown ): value is TransformablePropValue< string, unknown > =>
	typeof value === 'object' && value !== null && '$$type' in value;

export const isSizePropValue = ( value: unknown ): value is SizePropValue =>
	isTransformablePropValue( value ) && value.$$type === 'size';

const isFlatSizeField = ( value: unknown ): value is string | number | null =>
	typeof value === 'string' || typeof value === 'number' || value === null;

export const isFlatSizeInnerValue = ( value: unknown ): value is CanonicalSizeValue =>
	typeof value === 'object' &&
	value !== null &&
	isFlatSizeField( ( value as CanonicalSizeValue ).unit ) &&
	isFlatSizeField( ( value as CanonicalSizeValue ).size );

export const isNestedSizeInnerValue = ( value: unknown ): value is SizeInnerValue =>
	typeof value === 'object' &&
	value !== null &&
	( isTransformablePropValue( ( value as SizeInnerValue ).unit ) ||
		isTransformablePropValue( ( value as SizeInnerValue ).size ) );

const extractUnit = ( unit: SizePropValue[ 'value' ][ 'unit' ] ): string => {
	if ( typeof unit === 'string' ) {
		return unit;
	}

	return ensureNotNull( stringPropTypeUtil.extract( unit ), DEFAULT_SIZE_UNIT );
};

const extractSize = ( size: SizePropValue[ 'value' ][ 'size' ] ): string | number | null => {
	if ( typeof size === 'string' || typeof size === 'number' || size === null ) {
		return size;
	}

	return ensureNotNull(
		stringPropTypeUtil.extract( size ),
		numberPropTypeUtil.extract( size ) as string | number | null
	);
};

const canonicalizeSizeInnerFields = ( value: SizeInnerValue ): CanonicalSizeValue => ( {
	unit: extractUnit( value.unit ),
	size: extractSize( value.size ),
} );

export const normalizeSizeInnerValue = canonicalizeSizeInnerFields;

export const canonicalizeSizeValue = normalizeSizeInnerValue;

export const canonicalizeSizePropValue = ( propValue: PropValue ): PropValue => {
	if ( ! isSizePropValue( propValue ) ) {
		return propValue;
	}

	return {
		$$type: 'size',
		value: normalizeSizeInnerValue( propValue.value ),
	};
};

const toNestedSizeField = ( size: string | number | null ): PropValue => {
	if ( typeof size === 'number' ) {
		return {
			$$type: 'number',
			value: size,
		};
	}

	return {
		$$type: 'string',
		value: size === null ? '' : size,
	};
};

export const dialectizeSizeInnerValue = ( value: CanonicalSizeValue ): SizeInnerValue => ( {
	unit: {
		$$type: 'string',
		value: value.unit,
	},
	size: toNestedSizeField( value.size ),
} );

export const dialectizeSizePropValue = ( propValue: PropValue ): PropValue => {
	if ( ! isSizePropValue( propValue ) ) {
		return propValue;
	}

	return {
		$$type: 'size',
		value: dialectizeSizeInnerValue( normalizeSizeInnerValue( propValue.value ) ),
	};
};
