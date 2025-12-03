import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { type ComponentOverridablePropValue } from '../prop-types/component-overridable-prop-type';
import { type OverridableProps } from '../types';
import { selectOverridableProps, slice } from './store';

export function updateOverridablePropOriginValue( componentId: number, propValue: ComponentOverridablePropValue ) {
	const overridableProps = selectOverridableProps( getState(), componentId );

	if ( ! overridableProps ) {
		return;
	}

	const existingOverridableProp = overridableProps.props[ propValue.override_key ];

	if ( ! existingOverridableProp ) {
		return;
	}

	const newOverridableProps = {
		...overridableProps,
		props: {
			...overridableProps.props,
			[ existingOverridableProp.overrideKey ]: {
				...existingOverridableProp,
				originValue: propValue.origin_value,
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
