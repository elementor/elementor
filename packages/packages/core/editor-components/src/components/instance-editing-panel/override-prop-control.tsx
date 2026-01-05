import * as React from 'react';
import { useMemo } from 'react';
import { ControlReplacementsProvider, PropKeyProvider, PropProvider, useBoundProp } from '@elementor/editor-controls';
import {
	BaseControl,
	controlsRegistry,
	type ControlType,
	createTopLevelObjectType,
	ElementProvider,
	getControlReplacements,
	SettingsField,
	useElement,
} from '@elementor/editor-editing-panel';
import { type Control, getElementType } from '@elementor/editor-elements';
import { Stack } from '@elementor/ui';

import { useControlsByWidgetType } from '../../hooks/use-controls-by-widget-type';
import {
	type ComponentInstanceOverrideProp,
	componentInstanceOverridePropTypeUtil,
} from '../../prop-types/component-instance-override-prop-type';
import {
	type ComponentInstanceOverride,
	componentInstanceOverridesPropTypeUtil,
	type ComponentInstanceOverridesPropValue,
} from '../../prop-types/component-instance-overrides-prop-type';
import { componentInstancePropTypeUtil } from '../../prop-types/component-instance-prop-type';
import {
	type ComponentOverridableProp,
	componentOverridablePropTypeUtil,
} from '../../prop-types/component-overridable-prop-type';
import { OverridablePropProvider } from '../../provider/overridable-prop-context';
import { updateOverridableProp } from '../../store/actions/update-overridable-prop';
import { useCurrentComponentId } from '../../store/store';
import { type OriginPropFields, type OverridableProp } from '../../types';
import { getFinalWidgetPropValue } from '../../utils/get-final-widget-prop-value';
import { getPropTypeForComponentOverride } from '../../utils/get-prop-type-for-component-override';
import { ControlLabel } from '../control-label';

type Props = {
	overridableProp: OverridableProp;
	overrides?: ComponentInstanceOverridesPropValue;
};

type OverridesSchema = Record< string, ComponentInstanceOverride >;

export function OverridePropControl( { overridableProp, overrides }: Props ) {
	return (
		<SettingsField bind="component_instance" propDisplayName={ overridableProp.label }>
			<OverrideControl overridableProp={ overridableProp } overrides={ overrides } />
		</SettingsField>
	);
}

function OverrideControl( { overridableProp, overrides }: Props ) {
	const componentInstanceElement = useElement();
	const componentId = useCurrentComponentId();
	const { value: instanceValue, setValue: setInstanceValue } = useBoundProp( componentInstancePropTypeUtil );
	const controls = useControlsByWidgetType(
		overridableProp?.originPropFields?.widgetType ?? overridableProp.widgetType
	);
	const controlReplacements = useMemo( () => getControlReplacements(), [] );

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

	const propValue = matchingOverride ? getFinalWidgetPropValue( matchingOverride ) : overridableProp.originValue;

	const value = {
		[ overridableProp.overrideKey ]: propValue,
	} as OverridesSchema;

	const setValue = ( newValue: OverridesSchema ) => {
		const newPropValue = newValue[ overridableProp.overrideKey ] as
			| ComponentInstanceOverrideProp
			| ComponentOverridableProp;

		const newOverrideValue = createOverrideValue( {
			matchingOverride,
			overrideKey: overridableProp.overrideKey,
			overrideValue: newPropValue,
			componentId: componentInstanceId,
		} );

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
		<OverridablePropProvider
			value={ componentOverridablePropTypeUtil.extract( matchingOverride ) ?? undefined }
			componentInstanceElement={ componentInstanceElement }
		>
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
							<ControlReplacementsProvider replacements={ controlReplacements }>
								<Stack direction="column" gap={ 1 } mb={ 1.5 }>
									{ layout !== 'custom' && <ControlLabel>{ overridableProp.label }</ControlLabel> }
									<OriginalControl control={ control } controlProps={ controlProps } />
								</Stack>
							</ControlReplacementsProvider>
						</PropKeyProvider>
					</PropProvider>
				</SettingsField>
			</ElementProvider>
		</OverridablePropProvider>
	);
}

function getMatchingOverride(
	overrides: ComponentInstanceOverridesPropValue,
	overrideKey: string
): ComponentInstanceOverride | null {
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

function createOverrideValue( {
	matchingOverride,
	overrideKey,
	overrideValue,
	componentId,
}: {
	matchingOverride: ComponentInstanceOverride | null;
	overrideKey: string;
	overrideValue: ComponentInstanceOverrideProp | ComponentOverridableProp;
	componentId: number;
} ): ComponentInstanceOverride {
	// this is for a value is already set as overridable
	const overridableValue = componentOverridablePropTypeUtil.extract( matchingOverride );

	// this is for changes via the overridable-prop-indicator
	const newOverridableValue = componentOverridablePropTypeUtil.extract( overrideValue );

	const anyOverridable = newOverridableValue ?? overridableValue;

	if ( anyOverridable ) {
		const innerOverride = componentInstanceOverridePropTypeUtil.create( {
			override_key: overrideKey,
			override_value: getFinalWidgetPropValue( overrideValue ),
			schema_source: {
				type: 'component',
				id: componentId,
			},
		} );

		return componentOverridablePropTypeUtil.create( {
			override_key: anyOverridable.override_key,
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
