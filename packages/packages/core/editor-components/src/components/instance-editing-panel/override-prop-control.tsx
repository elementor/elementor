import * as React from 'react';
import { PropKeyProvider, PropProvider, useBoundProp } from '@elementor/editor-controls';
import {
	controlsRegistry,
	type ControlType,
	createTopLevelObjectType,
	SettingsField,
} from '@elementor/editor-editing-panel';
import { type Control, getWidgetsCache } from '@elementor/editor-elements';
import {
	type NumberPropValue,
	type PropType,
	type PropValue,
	type TransformablePropValue,
} from '@elementor/editor-props';
import { Stack } from '@elementor/ui';

import { componentInstanceOverridePropTypeUtil } from '../../prop-types/component-instance-override-prop-type';
import {
	componentInstanceOverridesPropTypeUtil,
	type ComponentInstanceOverridesPropValue,
} from '../../prop-types/component-instance-overrides-prop-type';
import { componentInstancePropTypeUtil } from '../../prop-types/component-instance-prop-type';
import { componentOverridablePropTypeUtil } from '../../prop-types/component-overridable-prop-type';
import { type OverridableProp } from '../../types';
import { ControlLabel } from '../control-label';

type Props = {
	overridableProp: OverridableProp;
	controls: Record< string, Record< string, Control > >;
	overrides?: ComponentInstanceOverridesPropValue | null;
};

export function OverridePropControl( { overridableProp, controls, overrides }: Props ) {
	return (
		<SettingsField bind="component_instance" propDisplayName={ overridableProp.label }>
			<OverrideControl overridableProp={ overridableProp } controls={ controls } overrides={ overrides } />
		</SettingsField>
	);
}

function OverrideControl( { overridableProp, controls, overrides }: Props ) {
	const { value: instanceValue, setValue: setInstanceValue } = useBoundProp( componentInstancePropTypeUtil );

	const widgetPropsSchema = getWidgetsCache()?.[ overridableProp.widgetType ]?.atomic_props_schema;
	const propType = widgetPropsSchema?.[ overridableProp.propKey ] as PropType;

	const propTypeSchema = createTopLevelObjectType( {
		schema: {
			[ overridableProp.overrideKey ]: propType,
		},
	} );

	const componentId = ( instanceValue.component_id as NumberPropValue )?.value;

	if ( ! componentId ) {
		throw new Error( 'Component ID is required' );
	}

	const matchingOverride = overrides?.find(
		( override ) => override.value.override_key === overridableProp.overrideKey
	);

	const propValue = matchingOverride ? getPropValue( matchingOverride ) : null;

	const value = {
		[ overridableProp.overrideKey ]: propValue,
	} as Record< string, TransformablePropValue< string, unknown > >;

	const setValue = ( newValue: Record< string, TransformablePropValue< string, unknown > > ) => {
		const newOverrideValue = newValue[ overridableProp.overrideKey ];

		const matchingItem = overrides?.find(
			( override ) => override.value.override_key === overridableProp.overrideKey
		);

		const newOverridableValue = getOverrideValue( overridableProp.overrideKey, newOverrideValue, componentId );

		// console.log( 'newOverridableValue', newOverridableValue );

		// const newOverridableValue = componentInstanceOverridePropTypeUtil.create( {
		// 	override_key: overridableProp.overrideKey,
		// 	override_value: newOverrideValue,
		// 	schema_source: {
		// 		type: 'component',
		// 		id: componentId,
		// 	},
		// } );

		// const newOverridableValue = componentOverridablePropTypeUtil.create( {
		// 	override_key: overridableProp.overrideKey,
		// 	origin_value: componentInstanceOverridePropTypeUtil.create( {
		// 		override_key: overridableProp.overrideKey,
		// 		override_value: newOverrideValue,
		// 		schema_source: {
		// 			type: 'component',
		// 			id: componentId,
		// 		},
		// 	} ),
		// } );

		let newOverrides =
			overrides?.map( ( override ) =>
				override.value.override_key === overridableProp.overrideKey ? newOverridableValue : override
			) ?? [];

		if ( ! matchingItem ) {
			newOverrides = [ ...newOverrides, newOverridableValue ];
		}

		setInstanceValue( {
			...instanceValue,
			overrides: componentInstanceOverridesPropTypeUtil.create( newOverrides ),
		} );
	};

	const relevantControls = controls[ overridableProp.widgetType ] ?? {};

	const ControlComponent = controlsRegistry.get(
		relevantControls[ overridableProp.propKey ].value.type as ControlType
	);

	const controlProps = relevantControls[ overridableProp.propKey ].value.props;

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
				<Stack direction="column" gap={ 1 }>
					<ControlLabel>{ overridableProp.label }</ControlLabel>
					<ControlComponent { ...controlProps } />
				</Stack>
			</PropKeyProvider>
		</PropProvider>
	);
}

function getPropValue( value: PropValue ): TransformablePropValue< string, unknown > | null {
	if ( componentOverridablePropTypeUtil.isValid( value ) ) {
		return value.value.origin_value as TransformablePropValue< string, unknown >;
	}

	if ( componentInstanceOverridePropTypeUtil.isValid( value ) ) {
		return value.value.override_value as TransformablePropValue< string, unknown >;
	}

	return null;
}

function getOverrideValue(
	overrideKey: string,
	overrideValue: PropValue,
	componentId: number
): NonNullable< ComponentInstanceOverridesPropValue >[ number ] {
	if ( componentOverridablePropTypeUtil.isValid( overrideValue ) ) {
		return componentOverridablePropTypeUtil.create( {
			override_key: overrideKey,
			origin_value: componentInstanceOverridePropTypeUtil.create( {
				override_key: overrideKey,
				override_value: overrideValue.value.origin_value,
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
