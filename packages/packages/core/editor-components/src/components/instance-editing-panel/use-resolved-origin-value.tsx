import { type PropValue } from '@elementor/editor-props';
import { __useSelector as useSelector } from '@elementor/store';

import { type ComponentInstanceOverride } from '../../prop-types/component-instance-overrides-prop-type';
import { componentOverridablePropTypeUtil } from '../../prop-types/component-overridable-prop-type';
import { selectData } from '../../store/store';
import { type OverridableProp, type PublishedComponent } from '../../types';
import { extractInnerOverrideInfo } from '../../utils/overridable-props-utils';
import { getOverridableProp } from '../overridable-props/utils/get-overridable-prop';

export function useResolvedOriginValue( override: ComponentInstanceOverride | null, overridableProp: OverridableProp ) {
	const components = useSelector( selectData );

	return resolveOriginValue( components, override, overridableProp );
}

function resolveOriginValue(
	components: PublishedComponent[],
	matchingOverride: ComponentInstanceOverride | null,
	overridableProp: OverridableProp
): PropValue {
	const { originValue: fallbackOriginValue, originPropFields } = overridableProp;

	if ( hasValue( fallbackOriginValue ) ) {
		return fallbackOriginValue;
	}

	if ( matchingOverride ) {
		const result = getOriginFromOverride( components, matchingOverride );

		if ( hasValue( result ) ) {
			return result;
		}
	}

	const { elementId, propKey } = originPropFields ?? {};

	if ( elementId && propKey ) {
		return findOriginValueByElementId( components, elementId, propKey );
	}

	return null;
}

function getOriginFromOverride( components: PublishedComponent[], override: ComponentInstanceOverride ): PropValue {
	const innerOverrideInfo = extractInnerOverrideInfo( override );

	if ( ! innerOverrideInfo ) {
		return null;
	}

	const { componentId, innerOverrideKey, overrideValue } = innerOverrideInfo;

	const prop = getOverridableProp( { componentId, overrideKey: innerOverrideKey } );

	if ( hasValue( prop?.originValue ) ) {
		return prop.originValue;
	}

	if ( prop?.originPropFields?.elementId ) {
		const targetPropKey = prop.originPropFields.propKey ?? prop.propKey;
		const result = findOriginValueByElementId( components, prop.originPropFields.elementId, targetPropKey );

		if ( hasValue( result ) ) {
			return result;
		}
	}

	const nestedOverridable = componentOverridablePropTypeUtil.extract( overrideValue );

	if ( nestedOverridable ) {
		return getOriginFromOverride( components, componentOverridablePropTypeUtil.create( nestedOverridable ) );
	}

	return null;
}

function findOriginValueByElementId(
	components: PublishedComponent[],
	targetElementId: string,
	targetPropKey: string,
	visited: Set< number > = new Set()
): PropValue {
	for ( const component of components ) {
		if ( visited.has( component.id ) ) {
			continue;
		}
		visited.add( component.id );

		const matchingProp = Object.values( component.overridableProps?.props ?? {} ).find(
			( { elementId, propKey } ) => elementId === targetElementId && propKey === targetPropKey
		);

		if ( ! matchingProp ) {
			continue;
		}

		if ( hasValue( matchingProp.originValue ) ) {
			return matchingProp.originValue;
		}

		if ( matchingProp.originPropFields?.elementId ) {
			const innerPropKey = matchingProp.originPropFields.propKey ?? targetPropKey;

			return findOriginValueByElementId(
				components,
				matchingProp.originPropFields.elementId,
				innerPropKey,
				visited
			);
		}
	}

	return null;
}

function hasValue< T >( value: T | null | undefined ): value is T {
	return value !== null && value !== undefined;
}
