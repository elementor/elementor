import {
	isEmpty,
	isTransformable,
	type PropKey,
	type PropType,
	type PropValue,
	type UnionPropType,
} from '@elementor/editor-props';
import { type BreakpointNode } from '@elementor/editor-responsive';
import { type StyleDefinition } from '@elementor/editor-styles';

import { getProviderByStyleId } from '../contexts/style-context';
import { createSnapshotsManager } from './create-snapshots-manager';
import { type BreakpointsStatesStyles, type StyleInheritanceMetaProps, type StylesInheritanceAPI } from './types';
import { getBreakpointKey, getStateKey } from './utils';

type ValidPropType = Exclude< PropType, UnionPropType >;

export function createStylesInheritance(
	styleDefs: StyleDefinition[],
	breakpointsRoot: BreakpointNode
): StylesInheritanceAPI {
	const styleVariantsByMeta = buildStyleVariantsByMetaMapping( styleDefs );

	const getStyles = ( { breakpoint, state }: StyleInheritanceMetaProps ) =>
		styleVariantsByMeta?.[ getBreakpointKey( breakpoint ) ]?.[ getStateKey( state ) ] ?? [];

	return {
		getSnapshot: createSnapshotsManager( getStyles, breakpointsRoot ),
		getInheritanceChain: ( snapshot, path, topLevelPropType ) => {
			const [ field, ...nextFields ] = path;

			let inheritanceChain = snapshot[ field ] ?? [];

			if ( nextFields.length > 0 ) {
				const filterPropType = getFilterPropType( topLevelPropType, nextFields );

				inheritanceChain = inheritanceChain
					.map( ( { value: styleValue, ...rest } ) => ( {
						...rest,
						value: getValueByPath( styleValue, nextFields, filterPropType ),
					} ) )
					.filter( ( { value: styleValue } ) => ! isEmpty( styleValue ) );
			}

			return inheritanceChain;
		},
	};
}

function buildStyleVariantsByMetaMapping( styleDefs: StyleDefinition[] ): BreakpointsStatesStyles {
	const breakpointStateSlots: BreakpointsStatesStyles = {};

	styleDefs.forEach( ( styleDef ) => {
		const provider = getProviderByStyleId( styleDef.id )?.getKey() ?? null;

		// iterate over each style definition's variants and place them in the corresponding breakpoint's base or state styles
		styleDef.variants.forEach( ( variant ) => {
			const { meta } = variant;
			const { state, breakpoint } = meta;

			const breakpointKey = getBreakpointKey( breakpoint );
			const stateKey = getStateKey( state );

			if ( ! breakpointStateSlots[ breakpointKey ] ) {
				breakpointStateSlots[ breakpointKey ] = {};
			}

			const breakpointNode = breakpointStateSlots[ breakpointKey ];

			if ( ! breakpointNode[ stateKey ] ) {
				breakpointNode[ stateKey ] = [];
			}

			breakpointNode[ stateKey ].push( {
				style: styleDef,
				variant,
				provider,
			} );
		} );
	} );

	return breakpointStateSlots;
}

function getValueByPath( value: PropValue, path: PropKey[], filterPropType: ValidPropType | null ): PropValue {
	if ( ! value || typeof value !== 'object' ) {
		return null;
	}

	if ( shouldUseOriginalValue( filterPropType, value ) ) {
		return value;
	}

	return path.reduce( ( currentScope: PropValue, key: PropKey ): PropValue | null => {
		if ( ! currentScope ) {
			return null;
		}

		if ( isTransformable( currentScope ) ) {
			return currentScope.value?.[ key ] ?? null;
		}

		if ( typeof currentScope === 'object' ) {
			return currentScope[ key as keyof typeof currentScope ] ?? null;
		}

		return null;
	}, value );
}

function shouldUseOriginalValue( filterPropType: ValidPropType | null, value: PropValue ): boolean {
	return !! filterPropType && isTransformable( value ) && filterPropType.key !== value.$$type;
}

const getFilterPropType = ( propType: PropType, path: string[] ): ValidPropType | null => {
	if ( ! propType || propType.kind !== 'union' ) {
		return null;
	}

	return (
		Object.values( propType.prop_types ).find( ( type: PropType ) => {
			return !! path.reduce( ( currentScope: PropType | null, key: string ) => {
				if ( currentScope?.kind !== 'object' ) {
					return null;
				}

				const { shape } = currentScope;

				if ( shape[ key ] ) {
					return shape[ key ];
				}

				return null;
			}, type );
		} ) ?? null
	);
};
