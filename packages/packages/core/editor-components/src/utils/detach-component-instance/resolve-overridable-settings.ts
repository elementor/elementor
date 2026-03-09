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

	return resolveOverridableSettingsForRegularElement( element, overrideMap );
}

function resolveOverridableSettingsForRegularElement(
	element: V1ElementData,
	overrideMap: Map< string, ComponentInstanceOverrideProp >
): V1ElementSettingsProps {
	const updatedSettings = { ...( element.settings ?? {} ) };

	for ( const [ settingKey, settingValue ] of Object.entries( element.settings ?? {} ) ) {
		if ( ! componentOverridablePropTypeUtil.isValid( settingValue ) ) {
			continue;
		}

		const innerOverrideKey = settingValue.value.override_key;
		const matchingOverride = overrideMap.get( innerOverrideKey );

		if ( ! matchingOverride ) {
			updatedSettings[ settingKey ] = settingValue.value.origin_value as PropValue;
			continue;
		}

		updatedSettings[ settingKey ] = matchingOverride.value.override_value as PropValue;
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

	const updatedOverrides = instanceOverrides.map( ( item ) => {
		if ( ! componentOverridablePropTypeUtil.isValid( item ) ) {
			return item;
		}

		const innerOverrideKey = item.value.override_key;
		const matchingOverride = overrideMap.get( innerOverrideKey );
		const innerOriginValue = item.value.origin_value as ComponentInstanceOverrideProp;

		if ( ! matchingOverride ) {
			return innerOriginValue;
		}

		return componentInstanceOverridePropTypeUtil.create( {
			override_key: innerOriginValue.value.override_key,
			override_value: matchingOverride.value.override_value,
			schema_source: innerOriginValue.value.schema_source,
		} );
	} );

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
