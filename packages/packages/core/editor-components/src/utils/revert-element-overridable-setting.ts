import { getContainer, getElementSetting, updateElementSettings } from '@elementor/editor-elements';

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
				// we revert only overridable values
				return item;
			}

			const isOriginValueOverride = componentInstanceOverridePropTypeUtil.isValid( item.value.origin_value );

			if ( ! isOriginValueOverride ) {
				// component instances cannot have overridables with origin value that is not an override
				return null;
			}

			if ( item.value.override_key !== overrideKey ) {
				return item;
			}

			return item.value.origin_value as ComponentInstanceOverrideProp;
		} )
		.filter( ( item ): item is NonNullable< typeof item > => item !== null );
}
