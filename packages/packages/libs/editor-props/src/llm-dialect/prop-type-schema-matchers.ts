import { type PropType, type UnionPropType } from '../types';

const SIZE_PROP_TYPE_KEYS = new Set( [ 'size', 'grid-track-size' ] );

export const isSizePropTypeDefinition = ( propType: PropType ): boolean =>
	SIZE_PROP_TYPE_KEYS.has( propType.key );

export const isHtmlV3PropTypeDefinition = ( propType: PropType ): boolean => propType.key === 'html-v3';

export const isUnionWithDynamicPropType = ( propType: PropType ): propType is UnionPropType =>
	propType.kind === 'union' && Boolean( ( propType as UnionPropType ).prop_types?.dynamic );
