import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { type ComponentId } from '../../types';
import { selectOverridableProps, slice } from '../store';
import { renameGroup } from '../utils/groups-transformers';

type RenameGroupParams = {
	componentId: ComponentId;
	groupId: string;
	label: string;
};

export function renameOverridableGroup( { componentId, groupId, label }: RenameGroupParams ): boolean {
	const overridableProps = selectOverridableProps( getState(), componentId );

	if ( ! overridableProps ) {
		return false;
	}

	const group = overridableProps.groups.items[ groupId ];

	if ( ! group ) {
		return false;
	}

	const updatedGroups = renameGroup( overridableProps.groups, groupId, label );

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
