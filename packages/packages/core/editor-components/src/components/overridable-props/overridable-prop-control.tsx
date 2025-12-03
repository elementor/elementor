import * as React from 'react';
import { type ComponentType } from 'react';
import { ControlReplacementsProvider, PropKeyProvider, PropProvider, useBoundProp } from '@elementor/editor-controls';
import { createTopLevelObjectType, useElement } from '@elementor/editor-editing-panel';
import { getCurrentDocumentId } from '@elementor/editor-elements';
import { type PropValue } from '@elementor/editor-props';
import { generateUniqueId } from '@elementor/utils';

import {
	componentOverridablePropTypeUtil,
	type ComponentOverridablePropValue,
} from '../../prop-types/component-overridable-prop-type';
import { updateOverridablePropOriginValue } from '../../store/update-overridable-prop-origin-value';

export function OverridablePropControl< T extends object >( {
	OriginalControl,
	...props
}: T & { OriginalControl: ComponentType< T > } ) {
	const { elementType } = useElement();

	const { value, bind, setValue, placeholder, ...propContext } = useBoundProp();
	const { extract, create } = componentOverridablePropTypeUtil;
	const componentId = getCurrentDocumentId() ?? 0;

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
			value={ { [ bind ]: currentValue.origin_value } }
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
