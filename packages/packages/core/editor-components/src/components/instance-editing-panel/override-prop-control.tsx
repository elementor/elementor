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
	ControlTypeContainer,
	createTopLevelObjectType,
	ElementProvider,
	isDynamicPropValue,
	SettingsField,
	useElement,
} from '@elementor/editor-editing-panel';
import { type Control, getElementSettings, getElementType } from '@elementor/editor-elements';
import { type AnyTransformable, type PropType, type PropValue } from '@elementor/editor-props';
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
import { computeDependentOverrideUpdates, extractDependencyEffect } from '../../utils/extract-dependency-effect';
import { getContainerByOriginId } from '../../utils/get-container-by-origin-id';
import { getPropTypeForComponentOverride } from '../../utils/get-prop-type-for-component-override';
import { getMatchingOverride } from '../../utils/overridable-props-utils';
import { resolveInstanceSettingsForDependencies } from '../../utils/resolve-instance-settings-for-dependencies';
import { resolveOverridePropValue } from '../../utils/resolve-override-prop-value';
import { ControlLabel } from '../control-label';
import { OverrideControlInnerElementNotFoundError } from '../errors';
import { useResolvedOriginValue } from './use-resolved-origin-value';
import { correctExposedEmptyOverride } from './utils/correct-exposed-empty-override';

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

	// Resolve origin element info
	const {
		elementId: originElementId,
		widgetType,
		elType,
		propKey,
	} = overridableProp.originPropFields ?? overridableProp;

	const element = getContainerByOriginId( originElementId, componentInstanceElement.element.id );

	if ( ! element ) {
		throw new OverrideControlInnerElementNotFoundError( {
			context: { componentId, elementId: originElementId },
		} );
	}
	const elementId = element.id;

	const type = elType === 'widget' ? widgetType : elType;
	const elementType = getElementType( type );

	if ( ! propType || ! elementType ) {
		return null;
	}

	// Resolve settings: unwrap overridables so the dependency system can evaluate them
	const rawSettings = elementType
		? getElementSettings< AnyTransformable >( elementId, Object.keys( elementType.propsSchema ) )
		: {};

	const resolvedSettings = elementType
		? resolveInstanceSettingsForDependencies( {
				elementSettings: rawSettings,
				elementId: originElementId,
				overridableProps,
				overrides: overrides ?? [],
		  } )
		: {};

	// Dependency effects (hide/disable/newValue) based on resolved settings
	const { isHidden, isDisabled, forcedNewValue } = extractDependencyEffect(
		propKey,
		elementType.propsSchema,
		resolvedSettings
	);

	// Override value resolution
	const resolvedOverrideValue = matchingOverride ? resolveOverridePropValue( matchingOverride ) : null;
	const propValue = resolvedOverrideValue ?? recursiveOriginValue ?? overridableProp.originValue;

	if ( isHidden ) {
		return null;
	}

	const value = {
		[ overridableProp.overrideKey ]: forcedNewValue ?? propValue,
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

		newPropValue = correctExposedEmptyOverride( newPropValue, matchingOverride );

		const newOverrideValue = createOverrideValue( {
			matchingOverride,
			overrideKey: overridableProp.overrideKey,
			overrideValue: newPropValue,
			componentId,
		} );

		// Collect all override updates: the changed prop + any dependents that need newValue applied
		const overrideUpdates = new Map< string, ComponentInstanceOverride >();
		overrideUpdates.set( overridableProp.overrideKey, newOverrideValue );

		const overrideRemovals = new Set< string >();

		try {
			const dependentUpdates = computeDependentOverrideUpdates( {
				changedPropKey: propKey,
				previousSettings: resolvedSettings,
				newSettings: {
					...resolvedSettings,
					[ propKey ]: resolveOverridePropValue( newOverrideValue ),
				},
				propsSchema: elementType.propsSchema,
				dependenciesPerTargetMapping: elementType.dependenciesPerTargetMapping ?? {},
			} );

			for ( const update of dependentUpdates ) {
				const dependentOverridable = findOverridableByPropKey(
					overridableProps,
					update.propKey,
					originElementId
				);

				if ( ! dependentOverridable ) {
					continue;
				}

				if ( update.newValue === null ) {
					overrideRemovals.add( dependentOverridable.overrideKey );
				} else {
					const dependentMatchingOverride = getMatchingOverride(
						overrides,
						dependentOverridable.overrideKey
					);

					overrideUpdates.set(
						dependentOverridable.overrideKey,
						createOverrideValue( {
							matchingOverride: dependentMatchingOverride,
							overrideKey: dependentOverridable.overrideKey,
							overrideValue: update.newValue as ComponentInstanceOverrideProp,
							componentId,
						} )
					);
				}
			}
		} catch ( e ) {
			// eslint-disable-next-line no-console
			console.error( 'Failed to compute dependent override updates', e );
		}

		// Apply all updates to the overrides array
		let updatedOverrides = ( overrides ?? [] )
			.filter( ( override ) => {
				if ( ! isValidOverride( overridableProps, override ) ) {
					return false;
				}
				return ! overrideRemovals.has( getOverrideKey( override ) );
			} )
			.map( ( override ) => {
				const key = getOverrideKey( override );
				return overrideUpdates.get( key ) ?? override;
			} );

		for ( const [ key, override ] of overrideUpdates ) {
			const alreadyExists = ( overrides ?? [] ).some( ( o ) => getOverrideKey( o ) === key );
			if ( ! alreadyExists ) {
				updatedOverrides = [ ...updatedOverrides, override ];
			}
		}

		setInstanceValue( {
			...instanceValue,
			overrides: componentInstanceOverridesPropTypeUtil.create( updatedOverrides ),
		} );

		const overridableValue = componentOverridablePropTypeUtil.extract( newOverrideValue );
		if ( overridableValue && wrappingComponentId ) {
			if ( overridableProp.originPropFields ) {
				updateOverridableProp( wrappingComponentId, overridableValue, overridableProp.originPropFields );

				return;
			}

			const { elType: et, widgetType: wt, propKey: pk, elementId: eid } = overridableProp;
			updateOverridableProp( wrappingComponentId, overridableValue, {
				elType: et,
				widgetType: wt,
				propKey: pk,
				elementId: eid,
			} );
		}
	};

	// Control rendering
	const { control, controlProps, layout } = getControlParams(
		controls,
		overridableProp?.originPropFields ?? overridableProp,
		overridableProp.label
	);

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
			<ElementProvider element={ { id: elementId, type } } elementType={ elementType } settings={ rawSettings }>
				<PropProvider
					propType={ propTypeSchema }
					value={ value }
					setValue={ setValue }
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
	return !! overridableProps.props[ getOverrideKey( override ) ];
}

function getOverrideKey( override: ComponentInstanceOverride ): string {
	return componentOverridablePropTypeUtil.isValid( override )
		? ( override.value.origin_value as ComponentInstanceOverrideProp )?.value.override_key
		: override.value.override_key;
}

function findOverridableByPropKey(
	overridableProps: OverridableProps,
	propKey: string,
	elementId: string
): OverridableProp | undefined {
	return Object.values( overridableProps.props ).find( ( prop ) => {
		const origin = prop.originPropFields ?? prop;
		return origin.propKey === propKey && origin.elementId === elementId;
	} );
}
