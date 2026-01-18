import {
	getAllDescendants,
	getContainer,
	getElementSetting,
	updateElementSettings,
	type V1Element,
	type V1ElementData,
	type V1ElementSettingsProps,
} from '@elementor/editor-elements';

import {
	type ComponentInstanceOverrideProp,
	componentInstanceOverridePropTypeUtil,
} from '../prop-types/component-instance-override-prop-type';
import {
	componentInstanceOverridesPropTypeUtil,
	type ComponentInstanceOverridesPropValue,
} from '../prop-types/component-instance-overrides-prop-type';
import {
	type ComponentInstanceProp,
	componentInstancePropTypeUtil,
	type ComponentInstancePropValue,
} from '../prop-types/component-instance-prop-type';
import { componentOverridablePropTypeUtil } from '../prop-types/component-overridable-prop-type';
import { isComponentInstance } from './is-component-instance';

export function revertElementOverridableSetting(
	elementId: string,
	settingKey: string,
	originValue: unknown,
	overrideKey: string
): void {
	const container = getContainer( elementId );

	if ( ! container ) {
		return;
	}

	if ( isComponentInstance( container.model.toJSON() ) ) {
		revertComponentInstanceSetting( elementId, overrideKey );

		return;
	}

	updateElementSettings( {
		id: elementId,
		props: { [ settingKey ]: originValue ?? null },
		withHistory: false,
	} );
}

function revertComponentInstanceSetting( elementId: string, overrideKey: string ): void {
	const setting = getElementSetting< ComponentInstanceProp >( elementId, 'component_instance' );

	const componentInstance = componentInstancePropTypeUtil.extract( setting );
	const overrides = componentInstanceOverridesPropTypeUtil.extract( componentInstance?.overrides );

	if ( ! overrides ) {
		return;
	}

	const updatedOverrides = getUpdatedComponentInstanceOverrides( overrides, overrideKey );

	const updatedSetting = componentInstancePropTypeUtil.create( {
		...componentInstance,
		overrides: componentInstanceOverridesPropTypeUtil.create( updatedOverrides ),
	} as ComponentInstancePropValue );

	updateElementSettings( {
		id: elementId,
		props: { component_instance: updatedSetting },
		withHistory: false,
	} );
}

function getUpdatedComponentInstanceOverrides(
	overrides: NonNullable< ComponentInstanceOverridesPropValue >,
	overrideKey: string
): ComponentInstanceOverridesPropValue {
	return overrides
		.map( ( item ) => {
			const isOverridable = componentOverridablePropTypeUtil.isValid( item );
			if ( ! isOverridable ) {
				return item;
			}

			const isOriginValueOverride = componentInstanceOverridePropTypeUtil.isValid( item.value.origin_value );

			if ( ! isOriginValueOverride ) {
				return null;
			}

			if ( item.value.override_key !== overrideKey ) {
				return item;
			}

			return item.value.origin_value as ComponentInstanceOverrideProp;
		} )
		.filter( ( item ): item is NonNullable< typeof item > => item !== null );
}

function cleanOverridablePropsFromSettings( settings: V1ElementSettingsProps ): V1ElementSettingsProps {
	const cleanedSettings: V1ElementSettingsProps = {};

	for ( const [ key, value ] of Object.entries( settings ) ) {
		if ( componentOverridablePropTypeUtil.isValid( value ) ) {
			cleanedSettings[ key ] = value.value.origin_value;
		} else {
			cleanedSettings[ key ] = value;
		}
	}

	return cleanedSettings;
}

function cleanAllOverridablesFromComponentInstanceOverrides(
	overrides: NonNullable< ComponentInstanceOverridesPropValue >
): ComponentInstanceOverridesPropValue {
	return overrides
		.map( ( item ) => {
			const isOverridable = componentOverridablePropTypeUtil.isValid( item );
			if ( ! isOverridable ) {
				return item;
			}

			const isOriginValueOverride = componentInstanceOverridePropTypeUtil.isValid( item.value.origin_value );

			if ( ! isOriginValueOverride ) {
				return null;
			}

			return item.value.origin_value as ComponentInstanceOverrideProp;
		} )
		.filter( ( item ): item is NonNullable< typeof item > => item !== null );
}

export function cleanAllOverridablesInElementData( elementData: V1ElementData ): V1ElementData {
	const cleanedElement = { ...elementData };

	if ( isComponentInstance( { widgetType: elementData.widgetType, elType: elementData.elType } ) ) {
		cleanedElement.settings = cleanComponentInstanceSettings( elementData.settings );
	} else if ( cleanedElement.settings ) {
		cleanedElement.settings = cleanOverridablePropsFromSettings( cleanedElement.settings );
	}

	if ( cleanedElement.elements ) {
		cleanedElement.elements = cleanedElement.elements.map( cleanAllOverridablesInElementData );
	}

	return cleanedElement;
}

function cleanComponentInstanceSettings( settings: V1ElementData[ 'settings' ] ): V1ElementData[ 'settings' ] {
	if ( ! settings?.component_instance ) {
		return settings;
	}

	const componentInstance = componentInstancePropTypeUtil.extract( settings.component_instance );
	const overrides = componentInstanceOverridesPropTypeUtil.extract( componentInstance?.overrides );

	if ( ! overrides?.length ) {
		return settings;
	}

	const cleanedOverrides = cleanAllOverridablesFromComponentInstanceOverrides( overrides );

	return {
		...settings,
		component_instance: componentInstancePropTypeUtil.create( {
			...componentInstance,
			overrides: componentInstanceOverridesPropTypeUtil.create( cleanedOverrides ),
		} as ComponentInstancePropValue ),
	};
}

export function cleanAllOverridablesInContainer( elementId: string ): void {
	const container = getContainer( elementId );

	if ( ! container ) {
		return;
	}

	getAllDescendants( container ).forEach( ( element ) => {
		if ( isComponentInstance( element.model.toJSON() ) ) {
			cleanComponentInstanceOverrides( element );
		} else {
			cleanElementSettings( element );
		}
	} );
}

function cleanComponentInstanceOverrides( element: V1Element ): void {
	const settings = element.settings?.toJSON() ?? {};
	const componentInstance = componentInstancePropTypeUtil.extract( settings.component_instance );
	const overrides = componentInstanceOverridesPropTypeUtil.extract( componentInstance?.overrides );

	if ( ! overrides?.length ) {
		return;
	}

	const cleanedOverrides = cleanAllOverridablesFromComponentInstanceOverrides( overrides );

	const updatedSetting = componentInstancePropTypeUtil.create( {
		...componentInstance,
		overrides: componentInstanceOverridesPropTypeUtil.create( cleanedOverrides ),
	} as ComponentInstancePropValue );

	updateElementSettings( {
		id: element.id,
		props: { component_instance: updatedSetting },
		withHistory: false,
	} );
}

function cleanElementSettings( element: V1Element ): void {
	const settings = element.settings?.toJSON() ?? {};
	const cleanedSettings = cleanOverridablePropsFromSettings( settings );

	const hasOverridables = Object.keys( settings ).some( ( key ) => settings[ key ] !== cleanedSettings[ key ] );

	if ( ! hasOverridables ) {
		return;
	}

	updateElementSettings( {
		id: element.id,
		props: cleanedSettings,
		withHistory: false,
	} );
}
