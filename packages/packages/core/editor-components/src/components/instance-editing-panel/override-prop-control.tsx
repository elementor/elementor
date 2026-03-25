import * as React from 'react';
import { useMemo } from 'react';
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
import { type Control, getElementSetting, getElementSettings, getElementType } from '@elementor/editor-elements';
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
import { getContainerByOriginId } from '../../utils/get-container-by-origin-id';
import { getOverridableProp } from '../../utils/get-overridable-prop';
import { getPropTypeForComponentOverride } from '../../utils/get-prop-type-for-component-override';
import { extractInnerOverrideInfo, getMatchingOverride } from '../../utils/overridable-props-utils';
import {
	applyInnerOverridesAndRewrap,
	applyOverridesToSettings,
	resolveOverridePropValue,
	unwrapOverridableSettings,
} from '../../utils/resolve-override-prop-value';
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
	console.log( '[OverrideControl]', {
		'componentInstanceElement.element.id': componentInstanceElement.element.id,
		'overridableProp.overrideKey': overridableProp.overrideKey,
		'overridableProp.label': overridableProp.label,
	} );
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

	const {
		elementId: originElementId,
		widgetType,
		elType,
		propKey,
	} = overridableProp.originPropFields ?? overridableProp;

	const { container: element, collectedOverrides } = findInnerElementContainer(
		overridableProp,
		componentInstanceElement.element.id,
		matchingOverride
	);

	if ( ! element ) {
		throw new OverrideControlInnerElementNotFoundError( { context: { componentId, elementId: originElementId } } );
	}
	const elementId = element.id;

	const type = elType === 'widget' ? widgetType : elType;
	const elementType = getElementType( type );

	const settings = getElementSettings< AnyTransformable >( elementId, Object.keys( elementType?.propsSchema ?? {} ) );

	const settingsWithInnerOverrides = useMemo(
		() => applyInnerOverridesAndRewrap( settings, collectedOverrides ),
		[ settings, collectedOverrides ]
	);

	const outerOverridesMap = useMemo( () => {
		if ( ! overrides ) {
			return {};
		}

		const map: Record< string, unknown > = {};

		for ( const override of overrides ) {
			const key = override.value.override_key;
			const value = resolveOverridePropValue( override );
			map[ key ] = value;
		}

		return map;
	}, [ overrides ] );

	const resolvedElementSettings = useMemo( () => {
		const withAllOverrides = applyOverridesToSettings( settingsWithInnerOverrides, outerOverridesMap );
		return unwrapOverridableSettings( withAllOverrides );
	}, [ settingsWithInnerOverrides, outerOverridesMap ] );

	console.log( `resolvedElementSettings for prop ${ propKey } in element ${ elementType?.title }-${ elementId }:`, {
		settingsWithInnerOverrides,
		resolvedElementSettings,
		collectedOverrides,
	} );

	const propType = getPropTypeForComponentOverride( overridableProp );

	if ( ! propType || ! elementType ) {
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

			const { elType: el, widgetType: wt, propKey: pk, elementId: eid } = overridableProp;
			updateOverridableProp( wrappingComponentId, overridableValue, {
				elType: el,
				widgetType: wt,
				propKey: pk,
				elementId: eid,
			} );
		}
	};

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
			<ElementProvider element={ { id: elementId, type } } elementType={ elementType } settings={ settings }>
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
								<Box mb={ 1.5 }>
									<ControlTypeContainer layout={ layout }>
										{ layout !== 'custom' && (
											<ControlLabel>{ overridableProp.label }</ControlLabel>
										) }
										<OriginalControl control={ control } controlProps={ controlProps } />
									</ControlTypeContainer>
								</Box>
							</ControlReplacementsProvider>
						</PropKeyProvider>
					</PropProvider>
				</SettingsField>
			</ElementProvider>
		</OverridablePropProvider>
	);
}

// temp solution to allow dynamic values to be overridden, will be removed once placeholder is implemented
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

type CollectedOverride = {
	innermostKey: string;
	outermostKey: string;
	value: unknown;
};

type InnerElementResult = {
	container: ReturnType< typeof getContainerByOriginId >;
	collectedOverrides: CollectedOverride[];
};

function findInnerElementContainer(
	overridableProp: OverridableProp,
	scopeElementId: string,
	matchingOverride: ComponentInstanceOverride | null,
	collectedOverrides: CollectedOverride[] = [],
	depth = 0
): InnerElementResult {
	if ( ! overridableProp.originPropFields ) {
		const result = getContainerByOriginId( overridableProp.elementId, scopeElementId );
		return { container: result, collectedOverrides };
	}

	const intermediateInstance = getContainerByOriginId( overridableProp.elementId, scopeElementId );

	if ( ! intermediateInstance ) {
		return { container: null, collectedOverrides };
	}

	const instanceSetting = getElementSetting( intermediateInstance.id, 'component_instance' );
	const instanceValue = componentInstancePropTypeUtil.extract( instanceSetting );
	const innerComponentId = instanceValue?.component_id?.value;
	const intermediateOverrides = componentInstanceOverridesPropTypeUtil.extract( instanceValue?.overrides );

	const mergedOverrides = collectOverridesFromLevel( collectedOverrides, intermediateOverrides ?? [] );

	const innerInfo = extractInnerOverrideInfo( matchingOverride );

	if ( ! innerInfo || ! innerComponentId ) {
		const result = getContainerByOriginId( overridableProp.originPropFields.elementId, intermediateInstance.id );
		return { container: result, collectedOverrides: mergedOverrides };
	}

	const innerOverridableProp = getOverridableProp( {
		componentId: innerComponentId,
		overrideKey: innerInfo.innerOverrideKey,
	} );

	if ( ! innerOverridableProp ) {
		const result = getContainerByOriginId( overridableProp.originPropFields.elementId, intermediateInstance.id );
		return { container: result, collectedOverrides: mergedOverrides };
	}

	const nextOverride = getMatchingOverride( intermediateOverrides ?? [], innerInfo.innerOverrideKey );

	return findInnerElementContainer(
		innerOverridableProp,
		intermediateInstance.id,
		nextOverride,
		mergedOverrides,
		depth + 1
	);
}

function collectOverridesFromLevel(
	existing: CollectedOverride[],
	levelOverrides: NonNullable< ReturnType< typeof componentInstanceOverridesPropTypeUtil.extract > >
): CollectedOverride[] {
	const result = [ ...existing ];
	const existingInnermostKeys = new Set( existing.map( ( o ) => o.innermostKey ) );

	for ( const override of levelOverrides ) {
		const overridableValue = componentOverridablePropTypeUtil.extract( override );

		if ( overridableValue ) {
			const innerOverride = componentInstanceOverridePropTypeUtil.extract( overridableValue.origin_value );

			if ( ! innerOverride ) {
				continue;
			}

			const innermostKey = innerOverride.override_key;
			const outermostKey = overridableValue.override_key;

			if ( innermostKey && ! existingInnermostKeys.has( innermostKey ) ) {
				result.push( { innermostKey, outermostKey, value: innerOverride.override_value } );
				existingInnermostKeys.add( innermostKey );
			}
		} else {
			const key = override.value.override_key;
			const value = resolveOverridePropValue( override );

			if ( key && ! existingInnermostKeys.has( key ) ) {
				result.push( { innermostKey: key, outermostKey: key, value } );
				existingInnermostKeys.add( key );
			}
		}
	}

	return result;
}

function isValidOverride( overridableProps: OverridableProps, override: ComponentInstanceOverride ): boolean {
	const overridableKey = componentOverridablePropTypeUtil.isValid( override )
		? ( override.value.origin_value as ComponentInstanceOverrideProp )?.value.override_key
		: override.value.override_key;

	return !! overridableProps.props[ overridableKey ];
}
