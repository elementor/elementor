import { type PropType, type TransformablePropValue } from '../../types';
import { isTransformable } from '../../utils/is-transformable';
import { type PropDialectAdapter } from '../registry';

const KNOWN_SIZE_TYPES = [ 'size', 'grid-track-size' ] as const;

type KnownSizeType = ( typeof KNOWN_SIZE_TYPES )[ number ];

type SizeInnerValue = {
	unit: unknown;
	size: unknown;
};

type SizePropValue = TransformablePropValue< KnownSizeType, SizeInnerValue >;

const isKnownSizeType = ( key: unknown ): key is KnownSizeType => KNOWN_SIZE_TYPES.includes( key as KnownSizeType );

const isKnownSizeContext = ( propType: PropType ): boolean => {
	if ( propType.kind === 'object' ) {
		return isKnownSizeType( propType.key );
	}

	if ( propType.kind === 'union' ) {
		return KNOWN_SIZE_TYPES.some( ( key ) => Object.hasOwn( propType.prop_types, key ) );
	}

	return false;
};

const isSizePropValue = ( value: unknown ): value is SizePropValue =>
	isTransformable( value ) && isKnownSizeType( value.$$type );

const compactField = ( field: unknown ): string | number | undefined => {
	if ( isTransformable( field ) ) {
		return field.value as string | number;
	}

	return field as string | number | undefined;
};

const expandField = < T = unknown >( field: T | TransformablePropValue< string, T > ) => {
	if ( isTransformable( field ) ) {
		return field;
	}

	return {
		$$type: typeof field === 'number' ? 'number' : 'string',
		value: field,
	};
};

export const sizeLlmDialectAdapter: PropDialectAdapter = {
	id: 'size',
	matches: ( { propType } ) => isKnownSizeContext( propType ),
	toPropValue: ( value ) => {
		if ( ! isSizePropValue( value ) ) {
			return value;
		}

		const inner = value.value;

		return {
			...value,
			value: {
				unit: compactField( inner.unit ),
				size: compactField( inner.size ),
			},
		};
	},
	toDialectValue: ( value ) => {
		if ( ! isSizePropValue( value ) ) {
			return value;
		}

		const inner = value.value;

		return {
			...value,
			value: {
				unit: expandField( inner.unit ),
				size: expandField( inner.size ),
			},
		};
	},
};
