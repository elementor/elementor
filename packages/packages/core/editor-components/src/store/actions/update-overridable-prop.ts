import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { type ComponentId, type OverridableProp } from '../../types';
import { selectOverridableProps, slice } from '../store';
import { movePropBetweenGroups } from '../utils/groups-transformers';

type UpdatePropParams = {
	componentId: ComponentId;
	propKey: string;
	label: string;
	groupId: string | null;
};

export function updateOverridableProp( {
	componentId,
	propKey,
	label,
	groupId,
}: UpdatePropParams ): OverridableProp | undefined {
	const overridableProps = selectOverridableProps( getState(), componentId );

	if ( ! overridableProps ) {
		return;
	}

	const prop = overridableProps.props[ propKey ];

	if ( ! prop ) {
		return;
	}

	const oldGroupId = prop.groupId;
	const newGroupId = groupId ?? oldGroupId;

	const updatedProp: OverridableProp = {
		...prop,
		label,
		groupId: newGroupId,
	};

	const updatedGroups = movePropBetweenGroups( overridableProps.groups, propKey, oldGroupId, newGroupId );

	dispatch(
		slice.actions.setOverridableProps( {
			componentId,
			overridableProps: {
				...overridableProps,
				props: {
					...overridableProps.props,
					[ propKey ]: updatedProp,
				},
				groups: updatedGroups,
			},
		} )
	);

	return updatedProp;
}
