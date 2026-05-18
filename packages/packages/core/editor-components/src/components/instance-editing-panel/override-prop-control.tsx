import * as React from 'react';
import {
	ControlReplacementsProvider,
	getControlReplacements,
	PropKeyProvider,
	PropProvider,
	type SetValueMeta,
	useBoundProp,
} from '@elementor/editor-controls';
import {
	BaseControl,
	controlsRegistry,
	type ControlType,
	ControlTypeContainer,
	createTopLevelObjectType,
	ElementProvider,
	isDynamicPropValue,
	SettingsField,
	useElement,
} from '@elementor/editor-editing-panel';
import { type Control } from '@elementor/editor-elements';
import { type AnyTransformable, type CreateOptions, type PropType, type PropValue } from '@elementor/editor-props';
import { Box } from '@elementor/ui';

import { useControlsByWidgetType } from '../../hooks/use-controls-by-widget-type';
import {
	type ComponentInstanceOverrideProp,
	componentInstanceOverridePropTypeUtil,
} from '../../prop-types/component-instance-override-prop-type';
import {
	type ComponentInstanceOverride,
	componentInstanceOverridesPropTypeUtil,
} from '../../prop-types/component-instance-overrides-prop-type';
import { componentInstancePropTypeUtil } from '../../prop-types/component-instance-prop-type';
import {
	type ComponentOverridableProp,
	componentOverridablePropTypeUtil,
} from '../../prop-types/component-overridable-prop-type';
import {
	useComponentId,
	useComponentInstanceOverrides,
	useComponentOverridableProps,
} from '../../provider/component-instance-context';
import { OverridablePropProvider } from '../../provider/overridable-prop-context';
import { updateOverridableProp } from '../../store/actions/update-overridable-prop';
import { useCurrentComponentId } from '../../store/store';
import { type OriginPropFields, type OverridableProp, type OverridableProps } from '../../types';
import { getPropTypeForComponentOverride } from '../../utils/get-prop-type-for-component-override';
import { getMatchingOverride } from '../../utils/overridable-props-utils';
import { resolveOverridePropValue } from '../../utils/resolve-override-prop-value';
import { ControlLabel } from '../control-label';
import { OverrideControlPropTypeNotFoundError } from '../errors';
import { correctExposedEmptyOverride } from './utils/correct-exposed-empty-override';
import { type ElementSettings, unwrapOverridableSettings } from './utils/resolve-element-settings';
import { useOverrideControlDependencies } from './utils/use-override-dependencies';
import { useResolvedInnerElement } from './utils/use-resolved-inner-element';

type Props = {
	overrideKey: string;
};

export function OverridePropControl( { overrideKey }: Props ) {
	const overridableProps = useComponentOverridableProps();
	const overridableProp = overridableProps.props[ overrideKey ];

	if ( ! overridableProp ) {
		return null;
	}

	return (
		<SettingsField bind="component_instance" propDisplayName={ overridableProp.label }>
			<OverrideControl overridableProp={ overridableProp } />
		</SettingsField>
	);
}

type InternalProps = {
	overridableProp: OverridableProp;
};
type OverridesSchema = Record< string, ComponentInstanceOverride >;

function OverrideControl( { overridableProp }: InternalProps ) {
	const componentInstanceElement = useElement();
	const { value: instanceValue, setValue: setInstanceValue } = useBoundProp( componentInstancePropTypeUtil );
	const wrappingComponentId = useCurrentComponentId();
	const componentId = useComponentId();
	const overridableProps = useComponentOverridableProps();
	const overrides = useComponentInstanceOverrides();

	const controls = useControlsByWidgetType(
		overridableProp.originPropFields?.widgetType ?? overridableProp.widgetType
	);
	const controlReplacements = getControlReplacements();

	const matchingOverride = getMatchingOverride( overrides, overridableProp.overrideKey );

	const { propKey } = overridableProp.originPropFields ?? overridableProp;
	const propType = getPropTypeForComponentOverride( overridableProp );

	if ( ! propType ) {
		throw new OverrideControlPropTypeNotFoundError( { context: { overridableProp } } );
	}

	const { elementId, elementType, resolvedElementSettings, resolvedOriginValues } =
		useResolvedInnerElement( overridableProp );

	const { overrideValue, isDisabled, isHidden } = useOverrideControlDependencies( {
		existingOverride: matchingOverride,
		resolvedElementSettings,
		elementType,
		elementId,
		propKey,
	} );

	if ( isHidden ) {
		return null;
	}

	const { propValue, baseValue: resolvedBaseValue } = resolveOverrideValues(
		matchingOverride,
		overrideValue,
		resolvedOriginValues,
		propKey
	);

	const value = {
		[ overridableProp.overrideKey ]: propValue,
	} as OverridesSchema;

	const baseValue = {
		[ overridableProp.overrideKey ]: resolvedBaseValue,
	} as OverridesSchema;

	const { control, controlProps, layout } = getControlParams(
		controls,
		overridableProp.originPropFields ?? overridableProp,
		overridableProp.label
	);

	const propTypeSchema = createTopLevelObjectType( {
		schema: { [ overridableProp.overrideKey ]: propType },
	} );

	const setValue = ( newValue: OverridesSchema, options?: CreateOptions, meta?: SetValueMeta ) => {
		let newPropValue = getTempNewValueForDynamicProp(
			propType,
			propValue,
			newValue[ overridableProp.overrideKey ]
		);

		newPropValue = correctExposedEmptyOverride( newPropValue, matchingOverride );

		const newOverrideValue = createOverrideValue( {
			matchingOverride,
			overrideKey: overridableProp.overrideKey,
			overrideValue: newPropValue,
			componentId,
		} );

		let newOverrides = ( overrides ?? [] )
			.filter( ( override ) => isValidOverride( overridableProps, override ) )
			.map( ( override ) => ( override === matchingOverride ? newOverrideValue : override ) );

		if ( ! matchingOverride ) {
			newOverrides = [ ...newOverrides, newOverrideValue ];
		}

		setInstanceValue(
			{
				...instanceValue,
				overrides: componentInstanceOverridesPropTypeUtil.create( newOverrides ),
			},
			options,
			meta
		);

		const overridableValue = componentOverridablePropTypeUtil.extract( newOverrideValue );
		if ( overridableValue && wrappingComponentId ) {
			if ( overridableProp.originPropFields ) {
				updateOverridableProp( wrappingComponentId, overridableValue, overridableProp.originPropFields );

				return;
			}

			const originPropFields = {
				elType: overridableProp.elType,
				widgetType: overridableProp.widgetType,
				propKey: overridableProp.propKey,
				elementId: overridableProp.elementId,
			};
			updateOverridableProp( wrappingComponentId, overridableValue, originPropFields );
		}
	};

	return (
		<OverridablePropProvider
			value={ componentOverridablePropTypeUtil.extract( matchingOverride ) ?? undefined }
			componentInstanceElement={ componentInstanceElement }
		>
			<ElementProvider
				element={ { id: elementId, type: elementType.key } }
				elementType={ elementType }
				settings={ resolvedElementSettings }
			>
				<PropProvider
					propType={ propTypeSchema }
					value={ value }
					setValue={ setValue }
					baseValue={ baseValue }
					isDisabled={ isDisabled }
				>
					<PropKeyProvider bind={ overridableProp.overrideKey }>
						<ControlReplacementsProvider replacements={ controlReplacements }>
							<Box mb={ 1.5 }>
								<ControlTypeContainer layout={ layout }>
									{ layout !== 'custom' && <ControlLabel>{ overridableProp.label }</ControlLabel> }
									<OriginalControl control={ control } controlProps={ controlProps } />
								</ControlTypeContainer>
							</Box>
						</ControlReplacementsProvider>
					</PropKeyProvider>
				</PropProvider>
			</ElementProvider>
		</OverridablePropProvider>
	);
}

function resolveOverrideValues(
	matchingOverride: ComponentInstanceOverride | null,
	overrideValue: AnyTransformable | null,
	resolvedOriginValues: ElementSettings,
	propKey: string
) {
	const unwrappedSettings = unwrapOverridableSettings( resolvedOriginValues );
	const inheritedValue = unwrappedSettings[ propKey ] ?? null;
	const isInheritedDynamic = isDynamicPropValue( inheritedValue );

	const shouldUseInheritedAsValue = isInheritedDynamic && ! matchingOverride;

	const propValue = shouldUseInheritedAsValue ? inheritedValue : overrideValue;
	const baseValue = matchingOverride || isInheritedDynamic ? null : inheritedValue;

	return { propValue, baseValue };
}

// Temp solution: when removing an override on a dynamic value, fall back to propType.default
// instead of null, since we don't have placeholder support for dynamics yet.
function getTempNewValueForDynamicProp( propType: PropType, propValue: PropValue, newPropValue: PropValue ) {
	const isRemovingOverride = newPropValue === null;

	if ( isRemovingOverride && isDynamicPropValue( propValue ) ) {
		return ( propType.default ?? null ) as ComponentInstanceOverrideProp | ComponentOverridableProp;
	}

	return newPropValue as ComponentInstanceOverrideProp | ComponentOverridableProp;
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
	const overridableValue = componentOverridablePropTypeUtil.extract( matchingOverride );

	const newOverridableValue = componentOverridablePropTypeUtil.extract( overrideValue );

	const anyOverridable = newOverridableValue ?? overridableValue;

	if ( anyOverridable ) {
		const innerOverride = componentInstanceOverridePropTypeUtil.create( {
			override_key: overrideKey,
			override_value: resolveOverridePropValue( overrideValue ),
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

function isValidOverride( overridableProps: OverridableProps, override: ComponentInstanceOverride ): boolean {
	const overridableKey = componentOverridablePropTypeUtil.isValid( override )
		? ( override.value.origin_value as ComponentInstanceOverrideProp )?.value.override_key
		: override.value.override_key;

	return !! overridableProps.props[ overridableKey ];
}
