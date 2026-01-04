import * as React from 'react';
import { ControlReplacementsProvider, PropKeyProvider, PropProvider, useBoundProp } from '@elementor/editor-controls';
import {
	BaseControl,
	controlsRegistry,
	type ControlType,
	createTopLevelObjectType,
	ElementProvider,
	SettingsField,
} from '@elementor/editor-editing-panel';
import { type Control, getElementType } from '@elementor/editor-elements';
import { type PropValue, type TransformablePropValue } from '@elementor/editor-props';
import { Stack } from '@elementor/ui';

import { useControlsByWidgetType } from '../../hooks/use-controls-by-widget-type';
import {
	type ComponentInstanceOverrideProp,
	componentInstanceOverridePropTypeUtil,
} from '../../prop-types/component-instance-override-prop-type';
import {
	componentInstanceOverridesPropTypeUtil,
	type ComponentInstanceOverridesPropValue,
} from '../../prop-types/component-instance-overrides-prop-type';
import { componentInstancePropTypeUtil } from '../../prop-types/component-instance-prop-type';
import {
	componentOverridablePropTypeUtil,
	type ComponentOverridablePropValue,
} from '../../prop-types/component-overridable-prop-type';
import { updateOverridableProp } from '../../store/actions/update-overridable-prop';
import { useCurrentComponentId } from '../../store/store';
import { type OriginPropFields, type OverridableProp } from '../../types';
import { getPropTypeForComponentOverride } from '../../utils/get-prop-type-for-component-override';
import { ControlLabel } from '../control-label';

type Props = {
	overridableProp: OverridableProp;
	overrides?: ComponentInstanceOverridesPropValue;
};

type OverridesSchema = Record< string, NonNullable< ComponentInstanceOverridesPropValue >[ number ] >;

export function OverridePropControl( { overridableProp, overrides }: Props ) {
	return (
		<SettingsField bind="component_instance" propDisplayName={ overridableProp.label }>
			<OverrideControl overridableProp={ overridableProp } overrides={ overrides } />
		</SettingsField>
	);
}

function OverrideControl( { overridableProp, overrides }: Props ) {
	const componentId = useCurrentComponentId();
	const { value: instanceValue, setValue: setInstanceValue } = useBoundProp( componentInstancePropTypeUtil );
	const controls = useControlsByWidgetType(
		overridableProp?.originPropFields?.widgetType ?? overridableProp.widgetType
	);

	const propType = getPropTypeForComponentOverride( overridableProp );

	if ( ! propType ) {
		return null;
	}

	const propTypeSchema = createTopLevelObjectType( {
		schema: {
			[ overridableProp.overrideKey ]: propType,
		},
	} );

	const componentInstanceId = instanceValue.component_id?.value;

	if ( ! componentInstanceId ) {
		throw new Error( 'Component ID is required' );
	}

	const matchingOverride = getMatchingOverride( overrides, overridableProp.overrideKey );

	const propValue = matchingOverride ? getPropValue( matchingOverride ) : overridableProp.originValue;

	const value = {
		[ overridableProp.overrideKey ]: propValue,
	} as OverridesSchema;

	const setValue = ( newValue: OverridesSchema ) => {
		const newPropValue = newValue[ overridableProp.overrideKey ] as
			| ComponentInstanceOverrideProp
			| ComponentOverridablePropValue;

		const newOverrideValue = createOverrideValue( overridableProp.overrideKey, newPropValue, componentInstanceId );

		let newOverrides =
			overrides?.map( ( override ) => ( override === matchingOverride ? newOverrideValue : override ) ) ?? [];

		if ( ! matchingOverride ) {
			newOverrides = [ ...newOverrides, newOverrideValue ];
		}

		setInstanceValue( {
			...instanceValue,
			overrides: componentInstanceOverridesPropTypeUtil.create( newOverrides ),
		} );

		const overridableValue = componentOverridablePropTypeUtil.extract( newOverrideValue );
		if ( overridableValue && componentId ) {
			if ( overridableProp.originPropFields ) {
				updateOverridableProp( componentId, overridableValue, overridableProp.originPropFields );

				return;
			}

			const { elType, widgetType, propKey, elementId } = overridableProp;
			updateOverridableProp( componentId, overridableValue, { elType, widgetType, propKey, elementId } );
		}
	};

	const { control, controlProps, layout } = getControlParams(
		controls,
		overridableProp?.originPropFields ?? overridableProp,
		overridableProp.label
	);

	const { elementId, widgetType, elType, propKey } = overridableProp.originPropFields ?? overridableProp;

	const type = elType === 'widget' ? widgetType : elType;
	const elementType = getElementType( type );

	if ( ! elementType ) {
		return null;
	}

	return (
		<ElementProvider element={ { id: elementId, type } } elementType={ elementType }>
			<SettingsField bind={ propKey } propDisplayName={ overridableProp.label }>
				<PropProvider
					propType={ propTypeSchema }
					value={ value }
					setValue={ setValue }
					isDisabled={ () => {
						return false;
					} }
				>
					<PropKeyProvider bind={ overridableProp.overrideKey }>
						<ControlReplacementsProvider replacements={ [] }>
							<Stack direction="column" gap={ 1 } mb={ 1.5 }>
								{ layout !== 'custom' && <ControlLabel>{ overridableProp.label }</ControlLabel> }
								<OriginalControl control={ control } controlProps={ controlProps } />
							</Stack>
						</ControlReplacementsProvider>
					</PropKeyProvider>
				</PropProvider>
			</SettingsField>
		</ElementProvider>
	);
}

function getPropValue( value: PropValue ): TransformablePropValue< string, unknown > | null {
	const overridableValue = componentOverridablePropTypeUtil.extract( value );

	if ( overridableValue ) {
		// if overridable - return as is and let the control replacement handle the overridable value
		return value as TransformablePropValue< string, unknown >;
	}

	if ( componentInstanceOverridePropTypeUtil.isValid( value ) ) {
		return value.value.override_value as TransformablePropValue< string, unknown >;
	}

	return null;
}

function getMatchingOverride(
	overrides: ComponentInstanceOverridesPropValue,
	overrideKey: string
): NonNullable< ComponentInstanceOverridesPropValue >[ number ] | null {
	return (
		overrides?.find( ( override ) => {
			const overridableValue = componentOverridablePropTypeUtil.extract( override );
			let comparedOverrideKey = null;

			if ( overridableValue ) {
				comparedOverrideKey = ( overridableValue.origin_value as ComponentInstanceOverrideProp )?.value
					?.override_key;
			} else {
				comparedOverrideKey = override.value.override_key;
			}

			return comparedOverrideKey === overrideKey;
		} ) ?? null
	);
}

function createOverrideValue(
	overrideKey: string,
	overrideValue: ComponentInstanceOverrideProp | ComponentOverridablePropValue,
	componentId: number
): NonNullable< ComponentInstanceOverridesPropValue >[ number ] {
	const overridableValue = componentOverridablePropTypeUtil.extract( overrideValue );

	if ( overridableValue ) {
		const innerOverride = componentInstanceOverridePropTypeUtil.create( {
			override_key: overrideKey,
			override_value: overridableValue.origin_value,
			schema_source: {
				type: 'component',
				id: componentId,
			},
		} );

		return componentOverridablePropTypeUtil.create( {
			override_key: overridableValue.override_key,
			origin_value: innerOverride,
		} );
	}

	return componentInstanceOverridePropTypeUtil.create( {
		override_key: overrideKey,
		override_value: overrideValue,
		schema_source: {
			type: 'component',
			id: componentId,
		},
	} );
}

function getControlParams( controls: Record< string, Control >, originPropFields: OriginPropFields, label?: string ) {
	const control = controls[ originPropFields.propKey ];
	const { value } = control;

	const layout = getControlLayout( control );

	const controlProps = populateChildControlProps( value.props );

	if ( layout === 'custom' ) {
		controlProps.label = label ?? value.label;
	}

	return {
		control,
		controlProps,
		layout,
	};
}

function OriginalControl( { control, controlProps }: { control: Control; controlProps: Record< string, unknown > } ) {
	const { value } = control;

	return <BaseControl type={ value.type as ControlType } props={ controlProps } />;
}

function getControlLayout( control: Control ) {
	return control.value.meta?.layout || controlsRegistry.getLayout( control.value.type as ControlType );
}

function populateChildControlProps( props: Record< string, unknown > ) {
	if ( props.childControlType ) {
		const childComponent = controlsRegistry.get( props.childControlType as ControlType );
		const childPropType = controlsRegistry.getPropTypeUtil( props.childControlType as ControlType );
		props = {
			...props,
			childControlConfig: {
				component: childComponent,
				props: props.childControlProps || {},
				propTypeUtil: childPropType,
			},
		};
	}

	return props;
}
