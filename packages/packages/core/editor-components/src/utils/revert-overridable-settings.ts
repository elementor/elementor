import {
	getAllDescendants,
	getContainer,
	getElementSetting,
	updateElementSettings,
	type V1Element,
	type V1ElementData,
	type V1ElementSettingsProps,
} from '@elementor/editor-elements';

import { COMPONENT_WIDGET_TYPE } from '../create-component-type';
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

type RevertSettingsResult = {
	hasChanges: boolean;
	settings: V1ElementSettingsProps;
};

export function revertElementOverridableSetting(
	elementId: string,
	settingKey: string,
	originValue: unknown,
	overrideKey: string
): void {
	// not sure - should check.
	const container = getContainer( elementId );

	if ( ! container ) {
		return;
	}

	if ( isComponentInstance( container.model.toJSON() ) ) {
		revertComponentInstanceOverridableSetting( elementId, overrideKey );

		return;
	}

	updateElementSettings( {
		id: elementId,
		props: { [ settingKey ]: originValue ?? null },
		withHistory: false,
	} );
}

function revertComponentInstanceOverridableSetting( elementId: string, overrideKey: string ): void {
	const setting = getElementSetting< ComponentInstanceProp >( elementId, 'component_instance' );

	const componentInstance = componentInstancePropTypeUtil.extract( setting );
	const overrides = componentInstanceOverridesPropTypeUtil.extract( componentInstance?.overrides );

	if ( ! overrides?.length ) {
		return;
	}

	const revertedOverrides = revertComponentInstanceOverrides( overrides, overrideKey );

	const updatedSetting = componentInstancePropTypeUtil.create( {
		...componentInstance,
		overrides: componentInstanceOverridesPropTypeUtil.create( revertedOverrides ),
	} as ComponentInstancePropValue );

	updateElementSettings( {
		id: elementId,
		props: { component_instance: updatedSetting },
		withHistory: false,
	} );
}

function revertComponentInstanceOverrides(
	overrides: NonNullable< ComponentInstanceOverridesPropValue >,
	filterByKey?: string
): ComponentInstanceOverridesPropValue {
	return overrides
		.map( ( item ) => {
			if ( ! componentOverridablePropTypeUtil.isValid( item ) ) {
				return item;
			}

			if ( ! componentInstanceOverridePropTypeUtil.isValid( item.value.origin_value ) ) {
				return null;
			}

			if ( filterByKey && item.value.override_key !== filterByKey ) {
				return item;
			}

			return item.value.origin_value as ComponentInstanceOverrideProp;
		} )
		.filter( ( item ): item is NonNullable< typeof item > => item !== null );
}

function revertOverridablePropsFromSettings( settings: V1ElementSettingsProps ): RevertSettingsResult {
	let hasChanges = false;
	const revertedSettings: V1ElementSettingsProps = {};

	for ( const [ key, value ] of Object.entries( settings ) ) {
		if ( componentOverridablePropTypeUtil.isValid( value ) ) {
			revertedSettings[ key ] = value.value.origin_value;
			hasChanges = true;
		} else {
			revertedSettings[ key ] = value;
		}
	}

	return { hasChanges, settings: revertedSettings };
}

export function revertAllOverridablesInElementData( elementData: V1ElementData ): V1ElementData {
	const revertedElement = { ...elementData };

	if ( isComponentInstance( { widgetType: elementData.widgetType, elType: elementData.elType } ) ) {
		revertedElement.settings = revertComponentInstanceSettings( elementData.settings );
	} else if ( revertedElement.settings ) {
		const { settings } = revertOverridablePropsFromSettings( revertedElement.settings );
		revertedElement.settings = settings;
	}

	if ( revertedElement.elements ) {
		revertedElement.elements = revertedElement.elements.map( revertAllOverridablesInElementData );
	}

	return revertedElement;
}

function revertComponentInstanceSettings( settings: V1ElementData[ 'settings' ] ): V1ElementData[ 'settings' ] {
	if ( ! settings?.component_instance ) {
		return settings;
	}

	const componentInstance = componentInstancePropTypeUtil.extract( settings.component_instance );
	const overrides = componentInstanceOverridesPropTypeUtil.extract( componentInstance?.overrides );

	if ( ! overrides?.length ) {
		return settings;
	}

	const revertedOverrides = revertComponentInstanceOverrides( overrides );

	return {
		...settings,
		component_instance: componentInstancePropTypeUtil.create( {
			...componentInstance,
			overrides: componentInstanceOverridesPropTypeUtil.create( revertedOverrides ),
		} as ComponentInstancePropValue ),
	};
}

export function revertAllOverridablesInContainer( container: V1Element ): void {
	getAllDescendants( container ).forEach( ( element ) => {
		if ( element.model.get( 'widgetType' ) === COMPONENT_WIDGET_TYPE ) {
			revertComponentInstanceOverridesInElement( element );
		} else {
			revertElementSettings( element );
		}
	} );
}

function revertComponentInstanceOverridesInElement( element: V1Element ): void {
	const settings = element.settings?.toJSON() ?? {};
	const componentInstance = componentInstancePropTypeUtil.extract( settings.component_instance );
	const overrides = componentInstanceOverridesPropTypeUtil.extract( componentInstance?.overrides );

	if ( ! overrides?.length ) {
		return;
	}

	const revertedOverrides = revertComponentInstanceOverrides( overrides );

	const updatedSetting = componentInstancePropTypeUtil.create( {
		...componentInstance,
		overrides: componentInstanceOverridesPropTypeUtil.create( revertedOverrides ),
	} as ComponentInstancePropValue );

	updateElementSettings( {
		id: element.id,
		props: { component_instance: updatedSetting },
		withHistory: false,
	} );
}

function revertElementSettings( element: V1Element ): void {
	const settings = element.settings?.toJSON() ?? {};
	const { hasChanges, settings: revertedSettings } = revertOverridablePropsFromSettings( settings );

	if ( ! hasChanges ) {
		return;
	}

	updateElementSettings( {
		id: element.id,
		props: revertedSettings,
		withHistory: false,
	} );
}
