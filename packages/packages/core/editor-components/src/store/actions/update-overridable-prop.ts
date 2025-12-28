import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { type ComponentOverridablePropValue } from '../../prop-types/component-overridable-prop-type';
import { type OriginPropFields, type OverridableProps } from '../../types';
import { selectOverridableProps, slice } from '../store';

export function updateOverridableProp(
	componentId: number,
	propValue: ComponentOverridablePropValue,
	originPropFields?: OriginPropFields
) {
	const overridableProps = selectOverridableProps( getState(), componentId );

	if ( ! overridableProps ) {
		return;
	}

	const existingOverridableProp = overridableProps.props[ propValue.override_key ];

	if ( ! existingOverridableProp ) {
		return;
	}

	const newOverridableProp = originPropFields
		? {
				originValue: propValue.origin_value,
				originPropFields,
		  }
		: {
				originValue: propValue.origin_value,
		  };

	const newOverridableProps = {
		...overridableProps,
		props: {
			...overridableProps.props,
			[ existingOverridableProp.overrideKey ]: {
				...existingOverridableProp,
				...newOverridableProp,
			},
		},
	} satisfies OverridableProps;

	dispatch(
		slice.actions.setOverridableProps( {
			componentId,
			overridableProps: newOverridableProps,
		} )
	);
}
