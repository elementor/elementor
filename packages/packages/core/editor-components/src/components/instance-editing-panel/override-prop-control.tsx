import * as React from 'react';
import { PropKeyProvider, PropProvider, useBoundProp } from '@elementor/editor-controls';
import {
	controlsRegistry,
	type ControlType,
	createTopLevelObjectType,
	SettingsField,
} from '@elementor/editor-editing-panel';
import { type Control } from '@elementor/editor-elements';
import { type NumberPropValue, type PropValue, type TransformablePropValue } from '@elementor/editor-props';
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
import { updateOverridablePropOriginValue } from '../../store/actions/update-overridable-prop-origin-value';
import { useCurrentComponentId } from '../../store/store';
import { type OverridableProp } from '../../types';
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
		overridableProp?.overridableProp?.widgetType ?? overridableProp.widgetType
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

	const componentInstanceId = ( instanceValue.component_id as NumberPropValue )?.value;

	if ( ! componentInstanceId ) {
		throw new Error( 'Component ID is required' );
	}

	const matchingOverride = getMatchingOverride( overrides, overridableProp.overrideKey );

	const propValue = matchingOverride ? getPropValue( matchingOverride ) : null;

	const value = {
		[ overridableProp.overrideKey ]: propValue,
	} as OverridesSchema;

	const setValue = ( newValue: OverridesSchema ) => {
		const newPropValue = newValue[ overridableProp.overrideKey ] as
			| ComponentInstanceOverrideProp
			| ComponentOverridablePropValue;

		const newOverrideValue = getOverrideValue( overridableProp.overrideKey, newPropValue, componentInstanceId );
		const overridableValue = componentOverridablePropTypeUtil.extract( newOverrideValue );

		let newOverrides =
			overrides?.map( ( override ) => ( override === matchingOverride ? newOverrideValue : override ) ) ?? [];

		if ( ! matchingOverride ) {
			newOverrides = [ ...newOverrides, newOverrideValue ];
		}

		setInstanceValue( {
			...instanceValue,
			overrides: componentInstanceOverridesPropTypeUtil.create( newOverrides ),
		} );

		if ( overridableValue && componentId ) {
			updateOverridablePropOriginValue(
				componentId,
				overridableValue,
				overridableProp.overridableProp ?? overridableProp
			);
		}
	};

	return (
		<PropProvider
			propType={ propTypeSchema }
			value={ value }
			setValue={ setValue }
			isDisabled={ () => {
				return false;
			} }
		>
			<PropKeyProvider bind={ overridableProp.overrideKey }>
				<Stack direction="column" gap={ 1 } mb={ 1.5 }>
					<ControlLabel>{ overridableProp.label }</ControlLabel>
					{ getControl( controls, overridableProp?.overridableProp ?? overridableProp ) }
				</Stack>
			</PropKeyProvider>
		</PropProvider>
	);
}

function getPropValue( value: PropValue ): TransformablePropValue< string, unknown > | null {
	const overridableValue = componentOverridablePropTypeUtil.extract( value );

	if ( overridableValue ) {
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
		overrides?.find( ( override ) =>
			componentOverridablePropTypeUtil.isValid( override )
				? ( override.value.origin_value as ComponentInstanceOverrideProp ).value?.override_key === overrideKey
				: override.value.override_key === overrideKey
		) ?? null
	);
}

function getOverrideValue(
	overrideKey: string,
	overrideValue: ComponentInstanceOverrideProp | ComponentOverridablePropValue,
	componentId: number
): NonNullable< ComponentInstanceOverridesPropValue >[ number ] {
	const overridableValue = componentOverridablePropTypeUtil.extract( overrideValue );

	if ( overridableValue ) {
		return componentOverridablePropTypeUtil.create( {
			override_key: overridableValue.override_key,
			origin_value: componentInstanceOverridePropTypeUtil.create( {
				override_key: overrideKey,
				override_value: overridableValue.origin_value,
				schema_source: {
					type: 'component',
					id: componentId,
				},
			} ),
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

function getControl( controls: Record< string, Control >, overridableProp: OverridableProp ) {
	const ControlComponent = controlsRegistry.get( controls[ overridableProp.propKey ].value.type as ControlType );

	const controlProps = controls[ overridableProp.propKey ].value.props;

	return <ControlComponent { ...controlProps } />;
}
