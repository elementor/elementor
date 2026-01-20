import { type PropValue } from '@elementor/editor-props';
import { __useSelector as useSelector } from '@elementor/store';

import { componentInstanceOverridePropTypeUtil } from '../../prop-types/component-instance-override-prop-type';
import { type ComponentInstanceOverride } from '../../prop-types/component-instance-overrides-prop-type';
import { componentOverridablePropTypeUtil } from '../../prop-types/component-overridable-prop-type';
import { selectData } from '../../store/store';
import { type OverridableProp, type PublishedComponent } from '../../types';

export function useResolvedOriginValue( override: ComponentInstanceOverride, overridableProp: OverridableProp ) {
	const components = useSelector( selectData );

	return resolveOriginValueFromStore( components, override, overridableProp );
}

function resolveOriginValueFromStore(
	components: PublishedComponent[],
	matchingOverride: ComponentInstanceOverride | null,
	overridableProp: OverridableProp
): PropValue | undefined {
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

	if ( originPropFields?.elementId ) {
		return findOriginValueByElementId( components, originPropFields.elementId );
	}

	return undefined;
}

function getOriginFromOverride(
	components: PublishedComponent[],
	override: ComponentInstanceOverride
): PropValue | undefined {
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

	const prop = getOverridableProp( components, componentId, overrideKey );

	if ( hasValue( prop?.originValue ) ) {
		return prop.originValue;
	}

	if ( prop?.originPropFields?.elementId ) {
		const result = findOriginValueByElementId( components, prop.originPropFields.elementId );
		if ( hasValue( result ) ) {
			return result;
		}
	}

	const nestedOverridable = componentOverridablePropTypeUtil.extract( overrideValue );
	if ( nestedOverridable ) {
		return getOriginFromOverride( components, componentOverridablePropTypeUtil.create( nestedOverridable ) );
	}

	return undefined;
}

function findOriginValueByElementId(
	components: PublishedComponent[],
	targetElementId: string,
	visited: Set< number > = new Set()
): PropValue | undefined {
	for ( const component of components ) {
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
			return findOriginValueByElementId( components, matchingProp.originPropFields.elementId, visited );
		}
	}

	return undefined;
}

function hasValue< T >( value: T | null | undefined ): value is T {
	return value !== null && value !== undefined;
}

function getOverridableProp( components: PublishedComponent[], componentId: number, overrideKey: string ) {
	const component = components.find( ( { id } ) => id === componentId );

	return component?.overridableProps?.props?.[ overrideKey ];
}
