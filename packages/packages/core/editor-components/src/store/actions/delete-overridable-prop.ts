import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { type ComponentId } from '../../types';
import { selectOverridableProps, slice } from '../store';
import { removePropFromAllGroups } from '../utils/overridable-props-transforms';

type DeletePropParams = {
	componentId: ComponentId;
	propKey: string;
};

export function deleteOverridableProp( { componentId, propKey }: DeletePropParams ): void {
	const overridableProps = selectOverridableProps( getState(), componentId );

	if ( ! overridableProps ) {
		return;
	}

	const prop = overridableProps.props[ propKey ];

	if ( ! prop ) {
		return;
	}

	const { [ propKey ]: removedProp, ...remainingProps } = overridableProps.props;

	const updatedGroups = removePropFromAllGroups( overridableProps.groups, propKey );

	dispatch(
		slice.actions.setOverridableProps( {
			componentId,
			overridableProps: {
				...overridableProps,
				props: remainingProps,
				groups: updatedGroups,
			},
		} )
	);
}
