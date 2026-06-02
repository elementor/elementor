import { type PropType } from '../types';

export const resolveUnionBranch = ( propType: PropType, typeKey: string ): PropType | undefined => {
	if ( propType.kind !== 'union' ) {
		return undefined;
	}

	return propType.prop_types[ typeKey ];
};

export const getUnionStaticBranches = ( propType: PropType ): PropType[] => {
	if ( propType.kind !== 'union' ) {
		return [];
	}

	return Object.entries( propType.prop_types ).flatMap( ( [ typeKey, memberPropType ] ) =>
		typeKey === 'dynamic' || typeKey === 'overridable' ? [] : [ memberPropType ]
	);
};

export const getStaticUnionBranch = ( propType: PropType ): PropType | undefined => getUnionStaticBranches( propType )[ 0 ];

export const isUnionWithDynamic = ( propType: PropType ): boolean =>
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
