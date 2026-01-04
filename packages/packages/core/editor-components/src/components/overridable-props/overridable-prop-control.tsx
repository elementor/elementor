import * as React from 'react';
import { type ComponentType } from 'react';
import { ControlReplacementsProvider, PropKeyProvider, PropProvider, useBoundProp } from '@elementor/editor-controls';
import { createTopLevelObjectType, useElement } from '@elementor/editor-editing-panel';
import { type PropValue } from '@elementor/editor-props';

import { type ComponentInstanceOverridePropValue } from '../../prop-types/component-instance-override-prop-type';
import {
	componentOverridablePropTypeUtil,
	type ComponentOverridablePropValue,
} from '../../prop-types/component-overridable-prop-type';
import { OverridablePropProvider } from '../../provider/overridable-prop-context';
import { updateOverridableProp } from '../../store/actions/update-overridable-prop';
import { useCurrentComponentId, useOverridableProps } from '../../store/store';
import { getPropTypeForComponentOverride } from '../../utils/get-prop-type-for-component-override';

export function OverridablePropControl< T extends object >( {
	OriginalControl,
	...props
}: T & { OriginalControl: ComponentType< T > } ) {
	const { elementType } = useElement();

	const { value, bind, setValue, placeholder, ...propContext } = useBoundProp( componentOverridablePropTypeUtil );
	const componentId = useCurrentComponentId();
	const overridableProps = useOverridableProps( componentId );

	if ( ! componentId ) {
		return null;
	}

	if ( ! value?.override_key ) {
		throw new Error( 'Override key is required' );
	}

	const isComponentInstance = elementType.key === 'e-component';

	const setOverridableValue = ( newValue: Record< typeof bind, PropValue | null > ) => {
		const propValue = {
			...value,
			origin_value: newValue[ bind ],
		} as ComponentOverridablePropValue;

		setValue( propValue );

		if ( ! isComponentInstance ) {
			const existingProp = overridableProps?.props?.[ propValue.override_key ];
			updateOverridableProp( componentId, propValue, existingProp?.originPropFields );
		}
	};

	const defaultPropType = elementType.propsSchema[ bind ];

	const overridePropType =
		isComponentInstance && overridableProps
			? getPropTypeForComponentOverride( overridableProps.props[ value.override_key ] )
			: undefined;

	const resolvedPropType = overridePropType ?? defaultPropType;

	if ( ! resolvedPropType ) {
		return null;
	}

	const propType = createTopLevelObjectType( {
		schema: {
			[ bind ]: resolvedPropType,
		},
	} );

	const propValue = (
		isComponentInstance
			? ( value.origin_value?.value as ComponentInstanceOverridePropValue ).override_value
			: value.origin_value
	) as PropValue;

	const objectPlaceholder: Record< string, PropValue > | undefined = placeholder
		? { [ bind ]: placeholder }
		: undefined;

	return (
		<OverridablePropProvider value={ value }>
			<PropProvider
				{ ...propContext }
				propType={ propType }
				setValue={ setOverridableValue }
				value={ {
					[ bind ]: propValue,
				} }
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
