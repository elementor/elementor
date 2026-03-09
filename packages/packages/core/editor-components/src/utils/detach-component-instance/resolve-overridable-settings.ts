import { type V1ElementData, type V1ElementSettingsProps } from '@elementor/editor-elements';
import { type PropValue } from '@elementor/editor-props';

import {
	type ComponentInstanceOverrideProp,
	componentInstanceOverridePropTypeUtil,
} from '../../prop-types/component-instance-override-prop-type';
import {
	type ComponentInstanceProp,
	componentInstancePropTypeUtil,
} from '../../prop-types/component-instance-prop-type';
import { componentOverridablePropTypeUtil } from '../../prop-types/component-overridable-prop-type';
import { isComponentInstance } from '../is-component-instance';

export function resolveOverridableSettings(
	element: V1ElementData,
	overrideMap: Map< string, ComponentInstanceOverrideProp >
): V1ElementSettingsProps {
	if ( isComponentInstance( { widgetType: element.widgetType, elType: element.elType } ) ) {
		return resolveOverridableSettingsForComponentInstance( element, overrideMap );
	}

	return resolveOverridableSettingsForElement( element, overrideMap );
}

function resolveOverridableSettingsForElement(
	element: V1ElementData,
	overrideMap: Map< string, ComponentInstanceOverrideProp >
): V1ElementSettingsProps {
	const updatedSettings = element.settings ? { ...element.settings } : {};

	for ( const [ settingKey, settingValue ] of Object.entries( element.settings ?? {} ) ) {
		updatedSettings[ settingKey ] = resolvePropValue( settingValue, overrideMap );
	}

	return updatedSettings;
}

function resolveOverridableSettingsForComponentInstance(
	element: V1ElementData,
	overrideMap: Map< string, ComponentInstanceOverrideProp >
): V1ElementSettingsProps {
	const componentInstance = element.settings?.component_instance as ComponentInstanceProp | undefined;

	if ( ! componentInstancePropTypeUtil.isValid( componentInstance ) ) {
		return element.settings ?? {};
	}

	const instanceOverrides = componentInstance.value.overrides?.value;

	if ( ! instanceOverrides?.length ) {
		return element.settings ?? {};
	}

	const updatedOverrides = instanceOverrides.map( ( item ) =>
		resolvePropValue( item, overrideMap, { isOverridableOverride: true } )
	);

	return {
		...element.settings,
		component_instance: {
			...componentInstance,
			value: {
				...componentInstance.value,
				overrides: {
					...componentInstance.value.overrides,
					value: updatedOverrides,
				},
			},
		},
	};
}

function resolvePropValue(
	propValue: PropValue,
	overrideMap: Map< string, ComponentInstanceOverrideProp >,
	options?: { isOverridableOverride?: boolean }
): PropValue | null {
	const { isOverridableOverride = false } = options ?? {};

	// if it's not an overridable, return the prop value as is
	if ( ! componentOverridablePropTypeUtil.isValid( propValue ) ) {
		return propValue;
	}

	const overridableKey = propValue.value.override_key;
	const matchingOverride = overrideMap.get( overridableKey );

	const originValue = componentOverridablePropTypeUtil.extract( propValue )?.origin_value;

	// if no matching override, return the overridable's origin value
	if ( ! matchingOverride ) {
		return originValue;
	}

	if ( isOverridableOverride ) {
		return resolveOverridableOverride( matchingOverride, originValue );
	}

	// for regular props, when there's a matching override, return the matching override value
	const matchingOverrideValue = componentInstanceOverridePropTypeUtil.extract( matchingOverride )
		?.override_value as PropValue | null;
	return matchingOverrideValue;
}

function resolveOverridableOverride(
	matchingOverride: ComponentInstanceOverrideProp,
	originValue: PropValue
): ComponentInstanceOverrideProp | null {
	if ( ! originValue || ! componentInstanceOverridePropTypeUtil.isValid( originValue ) ) {
		return null;
	}

	// for overridable overrides, we should create a new override with the matching override value
	// but keep the origin value's override key and schema source, so they'll match the inner component.
	return componentInstanceOverridePropTypeUtil.create( {
		override_value: matchingOverride.value.override_value,
		override_key: originValue.value.override_key,
		schema_source: originValue.value.schema_source,
	} );
}
