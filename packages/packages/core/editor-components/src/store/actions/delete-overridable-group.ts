import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { type ComponentId } from '../../types';
import { selectOverridableProps, slice } from '../store';
import { deleteGroup } from '../utils/groups-transformers';

type DeleteGroupParams = {
	componentId: ComponentId;
	groupId: string;
};

export function deleteOverridableGroup( { componentId, groupId }: DeleteGroupParams ): boolean {
	const overridableProps = selectOverridableProps( getState(), componentId );

	if ( ! overridableProps ) {
		return false;
	}

	const group = overridableProps.groups.items[ groupId ];

	if ( ! group || group.props.length > 0 ) {
		return false;
	}

	const updatedGroups = deleteGroup( overridableProps.groups, groupId );

	dispatch(
		slice.actions.setOverridableProps( {
			componentId,
			overridableProps: {
				...overridableProps,
				groups: updatedGroups,
			},
		} )
	);

	return true;
}
