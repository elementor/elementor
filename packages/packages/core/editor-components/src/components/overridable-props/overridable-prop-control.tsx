import * as React from 'react';
import {
	ControlReplacementsProvider,
	PropKeyProvider,
	PropProvider,
	type SetValue,
	useBoundProp,
} from '@elementor/editor-controls';
import { createTopLevelObjectType, SettingsControl, useElement } from '@elementor/editor-editing-panel';
import { type Control, type ControlItem } from '@elementor/editor-elements';
import { PropType, type PropValue } from '@elementor/editor-props';
import { generateUniqueId } from '@elementor/utils';
import { __ } from '@wordpress/i18n';

import {
	componentOverridablePropTypeUtil,
	type ComponentOverridablePropValue,
} from '../../prop-types/component-overridable-prop-type';

export function OverridablePropControl() {
	const { elementType } = useElement();

	const { value, bind, setValue, ...propContext } = useBoundProp();
	const allControls = useAllControls();
	const { extract, create } = componentOverridablePropTypeUtil;

	const control = allControls.find( ( control ) => control.value.bind === bind );

	if ( ! control ) {
		return null;
	}

	const currentValue = extract( value ) ?? {
		override_key: generateUniqueId(),
	};

	const setOverridableValue: SetValue< Record< string, ComponentOverridablePropValue > > = ( newValue ) => {
		setValue(
			create( {
				...currentValue,
				default_value: newValue[ bind ],
			} )
		);
	};
	
	const propType = createTopLevelObjectType( { schema: {
		[ bind ]: elementType.propsSchema[ bind ]
	} } );

	return (
		<PropProvider
			{ ...propContext }
			propType={ propType as PropType }
			setValue={ setOverridableValue }
			value={ { [ bind ]: currentValue.default_value as PropValue } }
		>
			<PropKeyProvider bind={ bind }>
				<ControlReplacementsProvider replacements={ [] }>
					<SettingsControl control={ control } renderOnlyInput />
				</ControlReplacementsProvider>
			</PropKeyProvider>
		</PropProvider>
	);
}

function useAllControls(): Control[] {
	const { elementType } = useElement();

	return iterateControls( elementType.controls );
}

function iterateControls( controls: ControlItem[] ): Control[] {
	return controls
		.map( ( control ) => {
			if ( control.type === 'control' && 'bind' in control.value ) {
				return control;
			}

			if ( control.type === 'section' ) {
				return iterateControls( control.value.items );
			}

			return null;
		} )
		.filter( Boolean )
		.flat() as Control[];
}

