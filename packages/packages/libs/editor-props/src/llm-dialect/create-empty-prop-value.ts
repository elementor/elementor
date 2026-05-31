import { getPropSchemaFromCache } from '../utils/create-prop-utils';
import { type ObjectPropType, type PropType, type PropValue, type UnionPropType } from '../types';

const STATIC_UNION_MEMBER_KEYS = new Set( [ 'dynamic', 'overridable' ] );

const getStaticUnionBranch = ( propType: UnionPropType ): PropType | undefined => {
	return Object.entries( propType.prop_types || {} ).find( ( [ key ] ) => ! STATIC_UNION_MEMBER_KEYS.has( key ) )?.[ 1 ];
};

const createEmptyValueForLeafPropType = ( propType: PropType & { key: string } ): PropValue => {
	if ( propType.initial_value !== null && propType.initial_value !== undefined ) {
		return structuredClone( propType.initial_value ) as PropValue;
	}

	const propUtil = getPropSchemaFromCache( propType.key );
	if ( propUtil ) {
		switch ( propType.kind ) {
			case 'string':
				return propUtil.create( '' );
			case 'number':
				return propUtil.create( null );
			case 'boolean':
				return propUtil.create( null );
			default:
				break;
		}
	}

	switch ( propType.kind ) {
		case 'string':
			return { $$type: propType.key, value: '' };
		case 'number':
			return { $$type: propType.key, value: null };
		case 'boolean':
			return { $$type: propType.key, value: null };
		default:
			return { $$type: propType.key, value: null };
	}
};

export const createEmptyPropValueForPropType = ( propType: PropType | undefined ): PropValue | undefined => {
	if ( ! propType ) {
		return undefined;
	}

	if ( propType.kind === 'union' ) {
		const staticBranch = getStaticUnionBranch( propType as UnionPropType );
		return staticBranch ? createEmptyPropValueForPropType( staticBranch ) : undefined;
	}

	if ( propType.kind === 'object' ) {
		const shape = ( propType as ObjectPropType ).shape || {};
		return {
			$$type: propType.key,
			value: Object.fromEntries(
				Object.entries( shape ).map( ( [ key, childPropType ] ) => [
					key,
					createEmptyPropValueForPropType( childPropType ),
				] )
			),
		};
	}

	if ( propType.kind === 'array' ) {
		return { $$type: propType.key, value: [] };
	}

	return createEmptyValueForLeafPropType( propType as PropType & { key: string } );
};
