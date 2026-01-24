import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { type ComponentId, type OverridableProp } from '../../types';
import { selectOverridableProps, slice } from '../store';
import { movePropBetweenGroups } from '../utils/groups-transformers';

type UpdatePropParams = {
	componentId: ComponentId;
	overrideKey: string;
	label: string;
	groupId: string | null;
};

export function updateOverridablePropParams( {
	componentId,
	overrideKey,
	label,
	groupId,
}: UpdatePropParams ): OverridableProp | undefined {
	const overridableProps = selectOverridableProps( getState(), componentId );

	if ( ! overridableProps ) {
		return;
	}

	const prop = overridableProps.props[ overrideKey ];

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

	const updatedGroups = movePropBetweenGroups( overridableProps.groups, overrideKey, oldGroupId, newGroupId );

	dispatch(
		slice.actions.setOverridableProps( {
			componentId,
			overridableProps: {
				...overridableProps,
				props: {
					...overridableProps.props,
					[ overrideKey ]: updatedProp,
				},
				groups: updatedGroups,
			},
		} )
	);

	return updatedProp;
}
