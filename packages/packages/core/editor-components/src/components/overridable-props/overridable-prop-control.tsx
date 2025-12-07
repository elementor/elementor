import * as React from 'react';
import { type ComponentType } from 'react';
import { ControlReplacementsProvider, PropKeyProvider, PropProvider, useBoundProp } from '@elementor/editor-controls';
import { createTopLevelObjectType, useElement } from '@elementor/editor-editing-panel';
import { type PropValue } from '@elementor/editor-props';
import { __getState as getState } from '@elementor/store';

import {
	componentOverridablePropTypeUtil,
	type ComponentOverridablePropValue,
} from '../../prop-types/component-overridable-prop-type';
import { selectCurrentComponentId } from '../../store/store';
import { updateOverridablePropOriginValue } from '../../store/update-overridable-prop-origin-value';

export function OverridablePropControl< T extends object >( {
	OriginalControl,
	...props
}: T & { OriginalControl: ComponentType< T > } ) {
	const { elementType } = useElement();

	const { value, bind, setValue, placeholder, ...propContext } = useBoundProp( componentOverridablePropTypeUtil );
	const componentId = selectCurrentComponentId( getState() );

	if ( ! componentId ) {
		throw new Error( 'Component ID is required' );
	}

	if ( ! value?.override_key ) {
		throw new Error( 'Override key is required' );
	}

	const setOverridableValue = ( newValue: Record< typeof bind, PropValue | null > ) => {
		const propValue = {
			...value,
			origin_value: newValue[ bind ],
		} as ComponentOverridablePropValue;

		setValue( propValue );
		updateOverridablePropOriginValue( componentId, propValue );
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
			value={ { [ bind ]: value.origin_value } }
			placeholder={ objectPlaceholder }
		>
			<PropKeyProvider bind={ bind }>
				<ControlReplacementsProvider replacements={ [] }>
					<OriginalControl { ...( props as T ) } />
				</ControlReplacementsProvider>
			</PropKeyProvider>
		</PropProvider>
	);
}
