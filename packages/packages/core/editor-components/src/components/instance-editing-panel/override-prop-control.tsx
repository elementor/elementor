import * as React from 'react';
import {
	ControlReplacementsProvider,
	getControlReplacements,
	PropKeyProvider,
	PropProvider,
	useBoundProp,
} from '@elementor/editor-controls';
import {
	BaseControl,
	controlsRegistry,
	type ControlType,
	createTopLevelObjectType,
	ElementProvider,
	extractOrderedDependencies,
	getUpdatedValues,
	isDynamicPropValue,
	SettingsField,
	useElement,
	type Values,
} from '@elementor/editor-editing-panel';
import { type Control, getElementType } from '@elementor/editor-elements';
import { propDependenciesMet, type PropType, type PropValue } from '@elementor/editor-props';
import { Stack } from '@elementor/ui';

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
import { getContainerByOriginId } from '../../utils/get-container-by-origin-id';
import { getPropTypeForComponentOverride } from '../../utils/get-prop-type-for-component-override';
import { getMatchingOverride } from '../../utils/overridable-props-utils';
import { resolveOverridePropValue } from '../../utils/resolve-override-prop-value';
import { ControlLabel } from '../control-label';
import { OverrideControlInnerElementNotFoundError } from '../errors';
import { useResolvedOriginValue } from './use-resolved-origin-value';

type Props = {
	overrideKey: string;
};

export function OverridePropControl( { overrideKey }: Props ) {
	const overridableProps = useComponentOverridableProps();
	const overridableProp = overridableProps?.props[ overrideKey ];

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
		overridableProp?.originPropFields?.widgetType ?? overridableProp.widgetType
	);
	const controlReplacements = getControlReplacements();

	const matchingOverride = getMatchingOverride( overrides, overridableProp.overrideKey );

	const recursiveOriginValue = useResolvedOriginValue( matchingOverride, overridableProp );

	if ( ! componentId ) {
		throw new Error( 'Component ID is required' );
	}

	if ( ! overridableProps ) {
		throw new Error( 'Component has no overridable props' );
	}

	const propType = getPropTypeForComponentOverride( overridableProp );

	if ( ! propType ) {
		return null;
	}

	const resolvedOverrideValue = matchingOverride ? resolveOverridePropValue( matchingOverride ) : null;
	const propValue = resolvedOverrideValue ?? recursiveOriginValue ?? overridableProp.originValue;

	const value = {
		[ overridableProp.overrideKey ]: propValue,
	} as OverridesSchema;

	const setValue = ( newValue: OverridesSchema ) => {
		if ( ! overridableProps ) {
			setInstanceValue( {
				...instanceValue,
				overrides: undefined,
			} );

			return;
		}

		let newPropValue = getTempNewValueForDynamicProp(
			propType,
			propValue,
			newValue[ overridableProp.overrideKey ]
		);

		const element = getContainerByOriginId(
			overridableProp.originPropFields?.elementId ?? overridableProp.elementId,
			componentInstanceElement.element.id
		);

		if ( element ) {
			const { widgetType, elType, propKey } = overridableProp.originPropFields ?? overridableProp;
			const innerElementId = element.id;
			const type = elType === 'widget' ? widgetType : elType;
			const elementType = getElementType( type );
			const dependenciesPerTargetMapping = elementType?.dependenciesPerTargetMapping ?? {};
			const filteredMapping = filterDependenciesForProp( dependenciesPerTargetMapping, propKey );
			const dependents = extractOrderedDependencies( filteredMapping );

			if ( dependents.length > 0 ) {
				const propsSchema = { [ propKey ]: propType };
				const elementValues = { [ propKey ]: propValue } as Values;
				const mergedNewPropValue = mergePropValueForOverride( propValue, newPropValue );
				const values = { [ propKey ]: mergedNewPropValue } as Values;
				const updatedValues = getUpdatedValues(
					values,
					dependents,
					propsSchema,
					elementValues,
					innerElementId
				);
				newPropValue = ( updatedValues[ propKey ] ?? newPropValue ) as
					| ComponentInstanceOverrideProp
					| ComponentOverridableProp;
			}
		}

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

		setInstanceValue( {
			...instanceValue,
			overrides: componentInstanceOverridesPropTypeUtil.create( newOverrides ),
		} );

		const overridableValue = componentOverridablePropTypeUtil.extract( newOverrideValue );
		if ( overridableValue && wrappingComponentId ) {
			if ( overridableProp.originPropFields ) {
				updateOverridableProp( wrappingComponentId, overridableValue, overridableProp.originPropFields );

				return;
			}

			const { elType, widgetType, propKey, elementId } = overridableProp;
			updateOverridableProp( wrappingComponentId, overridableValue, { elType, widgetType, propKey, elementId } );
		}
	};

	const { control, controlProps, layout } = getControlParams(
		controls,
		overridableProp?.originPropFields ?? overridableProp,
		overridableProp.label
	);

	const {
		elementId: originElementId,
		widgetType,
		elType,
		propKey,
	} = overridableProp.originPropFields ?? overridableProp;

	const element = getContainerByOriginId( originElementId, componentInstanceElement.element.id );

	if ( ! element ) {
		throw new OverrideControlInnerElementNotFoundError( { context: { componentId, elementId: originElementId } } );
	}
	const elementId = element.id;

	const type = elType === 'widget' ? widgetType : elType;
	const elementType = getElementType( type );

	if ( ! elementType ) {
		return null;
	}

	const propTypeSchema = createTopLevelObjectType( {
		schema: {
			[ overridableProp.overrideKey ]: propType,
		},
	} );

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
						isDisabled={ ( prop ) => ! propDependenciesMet( propKey, propValue )( prop ) }
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

function filterDependenciesForProp(
	dependenciesPerTargetMapping: Record< string, string[] >,
	propKey: string
): Record< string, string[] > {
	const prefix = `${ propKey }.`;

	return Object.fromEntries(
		Object.entries( dependenciesPerTargetMapping ).filter( ( [ target, dependents ] ) => {
			const targetUnderProp = target === propKey || target.startsWith( prefix );
			const dependentsUnderProp = dependents.every( ( d ) => d === propKey || d.startsWith( prefix ) );

			return targetUnderProp && dependentsUnderProp;
		} )
	);
}

function mergePropValueForOverride( propValue: PropValue, newPropValue: PropValue ): PropValue {
	if ( ! newPropValue ) {
		return propValue;
	}

	if ( ! propValue ) {
		return newPropValue;
	}

	const propVal =
		propValue && typeof propValue === 'object' && 'value' in propValue
			? ( propValue as { value: unknown } ).value
			: propValue;
	const newVal =
		newPropValue && typeof newPropValue === 'object' && 'value' in newPropValue
			? ( newPropValue as { value: unknown } ).value
			: newPropValue;

	if ( typeof propVal === 'object' && propVal !== null && typeof newVal === 'object' && newVal !== null ) {
		return {
			...( newPropValue as object ),
			value: { ...( propVal as object ), ...( newVal as object ) },
		} as PropValue;
	}

	return newPropValue;
}

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
	// this is for an override that's already set as overridable
	const overridableValue = componentOverridablePropTypeUtil.extract( matchingOverride );

	// this is for changes via the overridable-prop-indicator
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
