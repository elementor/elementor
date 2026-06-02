import { type PropType, type TransformablePropType, type UnionPropType } from '../types';

export const resolveUnionBranch = ( propType: PropType, typeKey: string ): PropType | undefined => {
	if ( propType.kind !== 'union' ) {
		return undefined;
	}

	return propType.prop_types[ typeKey ];
};

export const getUnionStaticBranches = ( propType: TransformablePropType | UnionPropType ): TransformablePropType[] => {
	if ( propType.kind !== 'union' ) {
		return [];
	}

	return Object.entries( propType.prop_types ).flatMap( ( [ typeKey, memberPropType ] ) =>
		typeKey === 'dynamic' || typeKey === 'overridable' ? [] : [ memberPropType ]
	);
};

export const getStaticUnionBranch = ( propType: PropType ): TransformablePropType | undefined =>
	getUnionStaticBranches( propType )[ 0 ];

export const isUnionWithDynamic = ( propType: PropType ): propType is UnionPropType =>
	propType.kind === 'union' && Object.hasOwn( propType.prop_types, 'dynamic' );

export const getShapeChildPropType = ( propType: PropType, key: string ): PropType | undefined => {
	if ( propType.kind !== 'object' ) {
		return undefined;
	}

	return propType.shape[ key ];
};

export const getArrayItemPropType = ( propType: PropType ): PropType | undefined => {
	if ( propType.kind !== 'array' ) {
		return undefined;
	}

	return propType.item_prop_type;
};
