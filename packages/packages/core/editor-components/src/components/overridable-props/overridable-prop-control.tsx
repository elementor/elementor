import * as React from 'react';
import { ControlReplacementsProvider, PropKeyProvider, PropProvider, useBoundProp } from '@elementor/editor-controls';
import { createTopLevelObjectType, SettingsControl, useElement } from '@elementor/editor-editing-panel';
import { type Control, type ControlItem, getCurrentDocumentId } from '@elementor/editor-elements';
import { type PropValue } from '@elementor/editor-props';
import { generateUniqueId } from '@elementor/utils';

import {
	componentOverridablePropTypeUtil,
	type ComponentOverridablePropValue,
} from '../../prop-types/component-overridable-prop-type';
import { updateOverridablePropDefaultValue } from '../../store/update-overridable-prop-default-value';

export function OverridablePropControl() {
	const { elementType } = useElement();

	const { value, bind, setValue, placeholder, ...propContext } = useBoundProp();
	const allControls = useAllControls();
	const { extract, create } = componentOverridablePropTypeUtil;
	const componentId = getCurrentDocumentId() ?? 0;

	const control = allControls.find( ( { value: { bind: controlBind } } ) => controlBind === bind );

	if ( ! control ) {
		return null;
	}

	const currentValue = extract( value ) ?? {
		override_key: generateUniqueId(),
		origin_value: null,
	};

	const setOverridableValue = ( newValue: Record< typeof bind, PropValue | null > ) => {
		const propValue = {
			...currentValue,
			origin_value: newValue[ bind ],
		} as ComponentOverridablePropValue;

		setValue( create( propValue ) );
		updateOverridablePropDefaultValue( componentId, propValue );
	};

	const propType = createTopLevelObjectType( {
		schema: {
			[ bind ]: elementType.propsSchema[ bind ],
		},
	} );

	const objectPlaceholder: Record< string, PropValue > | undefined = placeholder
		? { [ bind ]: placeholder }
		: undefined;

	return (
		<PropProvider
			{ ...propContext }
			propType={ propType }
			setValue={ setOverridableValue }
			value={ { [ bind ]: currentValue.origin_value } }
			placeholder={ objectPlaceholder }
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
