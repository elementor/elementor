import { componentsStore } from '../../../store/dispatchers';
import { type ComponentId, type OverridablePropsGroup } from '../../../types';
import { type Source, trackComponentEvent } from '../../../utils/tracking';

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
	const currentComponent = componentsStore.getCurrentComponent();

	const overridableProps = componentsStore.getOverridableProps( componentId );

	if ( ! overridableProps ) {
		return;
	}

	const newGroup: OverridablePropsGroup = {
		id: groupId,
		label,
		props: [],
	};

	componentsStore.setOverridableProps( componentId, {
		...overridableProps,
		groups: {
			...overridableProps.groups,
			items: {
				...overridableProps.groups.items,
				[ groupId ]: newGroup,
			},
			order: [ groupId, ...overridableProps.groups.order ],
		},
	} );

	trackComponentEvent( {
		action: 'propertiesGroupCreated',
		source,
		component_uid: currentComponent?.uid,
		group_name: label,
	} );

	return newGroup;
}
