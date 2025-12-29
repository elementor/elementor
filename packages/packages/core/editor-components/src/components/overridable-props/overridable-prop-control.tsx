import * as React from 'react';
import { type ComponentType } from 'react';
import { ControlReplacementsProvider, PropKeyProvider, PropProvider, useBoundProp } from '@elementor/editor-controls';
import { createTopLevelObjectType, useElement } from '@elementor/editor-editing-panel';
import { type PropValue } from '@elementor/editor-props';

import {
	componentOverridablePropTypeUtil,
	type ComponentOverridablePropValue,
} from '../../prop-types/component-overridable-prop-type';
import { OverridablePropProvider } from '../../provider/overridable-prop-context';
import { updateOverridablePropOriginValue } from '../../store/actions/update-overridable-prop-origin-value';
import { useCurrentComponentId } from '../../store/store';

export function OverridablePropControl< T extends object >( {
	OriginalControl,
	...props
}: T & { OriginalControl: ComponentType< T > } ) {
	const { elementType } = useElement();

	const { value, bind, setValue, placeholder, ...propContext } = useBoundProp( componentOverridablePropTypeUtil );
	const componentId = useCurrentComponentId();

	if ( ! componentId ) {
		return null;
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
		<OverridablePropProvider value={ value }>
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
		</OverridablePropProvider>
	);
}
