import { type PropValue } from '@elementor/editor-props';
import { __useSelector as useSelector } from '@elementor/store';

import { componentInstanceOverridePropTypeUtil } from '../../prop-types/component-instance-override-prop-type';
import { type ComponentInstanceOverride } from '../../prop-types/component-instance-overrides-prop-type';
import { componentOverridablePropTypeUtil } from '../../prop-types/component-overridable-prop-type';
import { type ComponentsSlice, selectOverridableProps, SLICE_NAME } from '../../store/store';
import { type OverridableProp } from '../../types';

export function useResolvedOriginValue( override: ComponentInstanceOverride, overridableProp: OverridableProp ) {
	return useSelector( ( state: ComponentsSlice ) => resolveOriginValueFromStore( state, override, overridableProp ) );
}

function resolveOriginValueFromStore(
	state: ComponentsSlice,
	matchingOverride: ComponentInstanceOverride | null,
	overridableProp: OverridableProp
): PropValue | undefined {
	const { originValue: fallbackOriginValue, originPropFields } = overridableProp;

	if ( hasValue( fallbackOriginValue ) ) {
		return fallbackOriginValue;
	}

	if ( matchingOverride ) {
		const result = getOriginFromOverride( state, matchingOverride );
		if ( hasValue( result ) ) {
			return result;
		}
	}

	if ( originPropFields?.elementId ) {
		return findOriginValueByElementId( state, originPropFields.elementId );
	}

	return undefined;
}

function getOriginFromOverride( state: ComponentsSlice, override: ComponentInstanceOverride ): PropValue | undefined {
	const overridableValue = componentOverridablePropTypeUtil.extract( override );
	const innerOverride = overridableValue
		? componentInstanceOverridePropTypeUtil.extract( overridableValue.origin_value )
		: componentInstanceOverridePropTypeUtil.extract( override );

	if ( ! innerOverride ) {
		return undefined;
	}

	const { schema_source: schemaSource, override_key: overrideKey, override_value: overrideValue } = innerOverride;
	const componentId = schemaSource?.id;

	if ( ! componentId || ! overrideKey ) {
		return undefined;
	}

	const prop = getOverridableProp( state, componentId, overrideKey );

	if ( hasValue( prop?.originValue ) ) {
		return prop.originValue;
	}

	if ( prop?.originPropFields?.elementId ) {
		const result = findOriginValueByElementId( state, prop.originPropFields.elementId );
		if ( hasValue( result ) ) {
			return result;
		}
	}

	const nestedOverridable = componentOverridablePropTypeUtil.extract( overrideValue );
	if ( nestedOverridable ) {
		return getOriginFromOverride( state, componentOverridablePropTypeUtil.create( nestedOverridable ) );
	}

	return undefined;
}

function findOriginValueByElementId(
	state: ComponentsSlice,
	targetElementId: string,
	visited: Set< number > = new Set()
): PropValue | undefined {
	for ( const component of state[ SLICE_NAME ].data ) {
		if ( visited.has( component.id ) ) {
			continue;
		}
		visited.add( component.id );

		const matchingProp = Object.values( component.overridableProps?.props ?? {} ).find(
			( prop ) => prop.elementId === targetElementId
		);

		if ( ! matchingProp ) {
			continue;
		}

		if ( hasValue( matchingProp.originValue ) ) {
			return matchingProp.originValue;
		}

		if ( matchingProp.originPropFields?.elementId ) {
			return findOriginValueByElementId( state, matchingProp.originPropFields.elementId, visited );
		}
	}

	return undefined;
}

function hasValue< T >( value: T | null | undefined ): value is T {
	return value !== null && value !== undefined;
}

function getOverridableProp( state: ComponentsSlice, componentId: number, overrideKey: string ) {
	return selectOverridableProps( state, componentId )?.props?.[ overrideKey ];
}
