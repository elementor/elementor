import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { type ComponentOverridablePropValue } from '../prop-types/component-overridable-prop-type';
import { type OverridableProps } from '../types';
import { selectOverridableProps, slice } from './store';

export function updateOverridablePropDefaultValue( componentId: number, propValue: ComponentOverridablePropValue ) {
	const overridableProps = selectOverridableProps( getState(), componentId );

	if ( ! overridableProps ) {
		return;
	}

	const existingOverridableProp = Object.values( overridableProps.props ).find(
		( { 'override-key': overrideKey } ) => overrideKey === propValue.override_key
	);

	if ( ! existingOverridableProp ) {
		return;
	}

	const newOverridableProps = {
		...overridableProps,
		props: {
			...overridableProps.props,
			[ existingOverridableProp[ 'override-key' ] ]: {
				...existingOverridableProp,
				defaultValue: propValue.default_value,
			},
		},
	} satisfies OverridableProps;

	dispatch(
		slice.actions.setOverridableProps( {
			componentId,
			overrides: newOverridableProps,
		} )
	);
}
