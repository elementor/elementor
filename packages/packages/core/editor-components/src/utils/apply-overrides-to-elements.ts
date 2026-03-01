import { type V1ElementData, type V1ElementSettingsProps } from '@elementor/editor-elements';
import { type PropValue } from '@elementor/editor-props';

import {
	type ComponentInstanceOverrideProp,
	componentInstanceOverridePropTypeUtil,
} from '../prop-types/component-instance-override-prop-type';
import { type ComponentInstanceOverride } from '../prop-types/component-instance-overrides-prop-type';
import { type ComponentInstanceProp, componentInstancePropTypeUtil } from '../prop-types/component-instance-prop-type';
import { componentOverridablePropTypeUtil } from '../prop-types/component-overridable-prop-type';
import { isComponentInstance } from './is-component-instance';

export function applyOverridesToElement(
	element: V1ElementData,
	overrides: ComponentInstanceOverride[]
): V1ElementData {
	const overrideMap = createOverrideMap( overrides );

	return applyOverridesToElementRecursive( element, overrideMap );
}

function createOverrideMap( overrides: ComponentInstanceOverride[] ): Map< string, ComponentInstanceOverride > {
	const map = new Map< string, ComponentInstanceOverride >();

	overrides.forEach( ( item ) => {
		if ( componentInstanceOverridePropTypeUtil.isValid( item ) ) {
			map.set( item.value.override_key, item );
		} else if ( componentOverridablePropTypeUtil.isValid( item ) ) {
			const originValue = item.value.origin_value as ComponentInstanceOverrideProp;
			map.set( originValue.value.override_key, item );
		}
	} );

	return map;
}

function applyOverridesToElementRecursive(
	element: V1ElementData,
	overrideMap: Map< string, ComponentInstanceOverride >
): V1ElementData {
	const updatedElement = { ...element };

	if ( updatedElement.settings ) {
		if ( isComponentInstance( { widgetType: element.widgetType, elType: element.elType } ) ) {
			updatedElement.settings = applyOverridesToComponentInstanceSettings( updatedElement.settings, overrideMap );
		} else {
			updatedElement.settings = applyOverridesToRegularSettings( updatedElement.settings, overrideMap );
		}
	}

	if ( updatedElement.elements?.length ) {
		updatedElement.elements = updatedElement.elements.map( ( child ) =>
			applyOverridesToElementRecursive( child, overrideMap )
		);
	}

	return updatedElement;
}

function applyOverridesToRegularSettings(
	settings: V1ElementSettingsProps,
	overrideMap: Map< string, ComponentInstanceOverride >
): V1ElementSettingsProps {
	const updatedSettings = { ...settings };

	for ( const [ settingKey, settingValue ] of Object.entries( settings ) ) {
		if ( ! componentOverridablePropTypeUtil.isValid( settingValue ) ) {
			continue;
		}

		const overrideKey = settingValue.value.override_key;
		const matchingItem = overrideMap.get( overrideKey );

		if ( ! matchingItem ) {
			updatedSettings[ settingKey ] = settingValue.value.origin_value as PropValue;
			continue;
		}

		if ( componentOverridablePropTypeUtil.isValid( matchingItem ) ) {
			const innerOverride = matchingItem.value.origin_value as ComponentInstanceOverrideProp;
			updatedSettings[ settingKey ] = componentOverridablePropTypeUtil.create( {
				override_key: matchingItem.value.override_key,
				origin_value: innerOverride.value.override_value as { $$type: string; value?: unknown } | null,
			} ) as PropValue;
		} else if ( componentInstanceOverridePropTypeUtil.isValid( matchingItem ) ) {
			updatedSettings[ settingKey ] = matchingItem.value.override_value as PropValue;
		}
	}

	return updatedSettings;
}

function applyOverridesToComponentInstanceSettings(
	settings: V1ElementSettingsProps,
	overrideMap: Map< string, ComponentInstanceOverride >
): V1ElementSettingsProps {
	const componentInstance = settings.component_instance as ComponentInstanceProp | undefined;

	if ( ! componentInstancePropTypeUtil.isValid( componentInstance ) ) {
		return settings;
	}

	const instanceOverrides = componentInstance.value.overrides?.value;

	if ( ! instanceOverrides?.length ) {
		return settings;
	}

	const updatedOverrides = instanceOverrides.map( ( item ) => {
		if ( ! componentOverridablePropTypeUtil.isValid( item ) ) {
			return item;
		}

		const innerOverrideKey = item.value.override_key;
		const matchingItem = overrideMap.get( innerOverrideKey );
		const innerOriginValue = item.value.origin_value as ComponentInstanceOverrideProp;

		if ( ! matchingItem ) {
			return innerOriginValue;
		}

		if ( componentOverridablePropTypeUtil.isValid( matchingItem ) ) {
			const outerOriginValue = matchingItem.value.origin_value as ComponentInstanceOverrideProp;
			return componentOverridablePropTypeUtil.create( {
				override_key: matchingItem.value.override_key,
				origin_value: componentInstanceOverridePropTypeUtil.create( {
					override_key: innerOriginValue.value.override_key,
					override_value: outerOriginValue.value.override_value,
					schema_source: innerOriginValue.value.schema_source,
				} ),
			} );
		}

		if ( componentInstanceOverridePropTypeUtil.isValid( matchingItem ) ) {
			return componentInstanceOverridePropTypeUtil.create( {
				override_key: innerOriginValue.value.override_key,
				override_value: matchingItem.value.override_value,
				schema_source: innerOriginValue.value.schema_source,
			} );
		}

		return innerOriginValue;
	} );

	return {
		...settings,
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
