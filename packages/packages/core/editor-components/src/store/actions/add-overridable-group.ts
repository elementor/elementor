import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { type ComponentId, type OverridablePropsGroup } from '../../types';
import { type Source, trackComponentEvent } from '../../utils/tracking';
import { selectCurrentComponent, selectOverridableProps, slice } from '../store';

type AddGroupParams = {
	componentId: ComponentId;
	groupId: string;
	label: string;
	source: Source;
};

export function addOverridableGroup( {
	componentId,
	groupId,
	label,
	source,
}: AddGroupParams ): OverridablePropsGroup | undefined {
	const currentComponent = selectCurrentComponent( getState() );

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

	trackComponentEvent( {
		action: 'propertiesGroupCreated',
		source,
		component_uid: currentComponent?.uid,
		group_name: label,
	} );

	return newGroup;
}
