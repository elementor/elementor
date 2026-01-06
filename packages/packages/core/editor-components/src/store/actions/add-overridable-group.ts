import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { type ComponentId, type OverridablePropsGroup } from '../../types';
import { selectOverridableProps, slice } from '../store';

type AddGroupParams = {
	componentId: ComponentId;
	groupId: string;
	label: string;
};

export function addOverridableGroup( {
	componentId,
	groupId,
	label,
}: AddGroupParams ): OverridablePropsGroup | undefined {
	const overridableProps = selectOverridableProps( getState(), componentId );

	if ( ! overridableProps ) {
		return;
	}

	const newGroup: OverridablePropsGroup = {
		id: groupId,
		label,
		props: [],
	};

	dispatch(
		slice.actions.setOverridableProps( {
			componentId,
			overridableProps: {
				...overridableProps,
				groups: {
					...overridableProps.groups,
					items: {
						...overridableProps.groups.items,
						[ groupId ]: newGroup,
					},
					order: [ groupId, ...overridableProps.groups.order ],
				},
			},
		} )
	);

	return newGroup;
}
