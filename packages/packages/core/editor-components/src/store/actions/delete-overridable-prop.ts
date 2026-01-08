import { getContainer, getElementSetting, updateElementSettings } from '@elementor/editor-elements';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import {
	type ComponentInstanceOverrideProp,
	componentInstanceOverridePropTypeUtil,
} from '../../prop-types/component-instance-override-prop-type';
import {
	componentInstanceOverridesPropTypeUtil,
	type ComponentInstanceOverridesPropValue,
} from '../../prop-types/component-instance-overrides-prop-type';
import {
	type ComponentInstanceProp,
	componentInstancePropTypeUtil,
	type ComponentInstancePropValue,
} from '../../prop-types/component-instance-prop-type';
import { type ComponentId } from '../../types';
import { selectOverridableProps, slice } from '../store';
import { removePropFromAllGroups } from '../utils/groups-transformers';

type DeletePropParams = {
	componentId: ComponentId;
	propKey: string;
};

export function deleteOverridableProp( { componentId, propKey }: DeletePropParams ): void {
	const overridableProps = selectOverridableProps( getState(), componentId );

	if ( ! overridableProps ) {
		return;
	}

	const prop = overridableProps.props[ propKey ];

	if ( ! prop ) {
		return;
	}

	revertElementSetting( prop.elementId, prop.propKey, prop.originValue );

	const { [ propKey ]: removedProp, ...remainingProps } = overridableProps.props;

	const updatedGroups = removePropFromAllGroups( overridableProps.groups, propKey );

	dispatch(
		slice.actions.setOverridableProps( {
			componentId,
			overridableProps: {
				...overridableProps,
				props: remainingProps,
				groups: updatedGroups,
			},
		} )
	);
}

function revertElementSetting( elementId: string, settingKey: string, originValue: unknown ): void {
	const container = getContainer( elementId );

	if ( ! container ) {
		return;
	}

	if ( container.model.get( 'widgetType' ) === 'e-component' ) {
		revertComponentInstanceSetting( elementId, settingKey );

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

	if ( ! setting?.value.overrides ) {
		return;
	}

	const componentInstance = componentInstancePropTypeUtil.extract( setting );
	const overrides = componentInstanceOverridesPropTypeUtil.extract( componentInstance?.overrides );

	if ( ! overrides ) {
		return;
	}

	const updatedSetting = componentInstancePropTypeUtil.create( {
		...componentInstance,
		overrides: componentInstanceOverridesPropTypeUtil.create(
			getUpdatedComponentInstanceOverrides( overrides, overrideKey )
		),
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
		.map( ( override ) => {
			const isOverride = componentInstanceOverridePropTypeUtil.isValid( override );
			if ( isOverride ) {
				// we revert only overridable values
				return override;
			}

			if ( override.value.override_key !== overrideKey ) {
				return override;
			}

			const isOriginValueOverride = componentInstanceOverridePropTypeUtil.isValid( override.value.origin_value );

			if ( ! isOriginValueOverride ) {
				// component instances cannot have overridables with origin value that is not an override
				return null;
			}

			const originalOverride = override.value.origin_value as ComponentInstanceOverrideProp;

			return componentInstanceOverridePropTypeUtil.create( {
				...originalOverride.value,
				override_key: overrideKey,
			} );
		} )
		.filter( ( item ): item is NonNullable< typeof item > => item !== null );
}
