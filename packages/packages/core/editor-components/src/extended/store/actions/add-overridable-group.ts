import { componentsActions } from '../../../store/dispatchers';
import { componentsSelectors } from '../../../store/selectors';
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
	const currentComponent = componentsSelectors.getCurrentComponent();

	const overridableProps = componentsSelectors.getOverridableProps( componentId );

	if ( ! overridableProps ) {
		return;
	}

	const newGroup: OverridablePropsGroup = {
		id: groupId,
		label,
		props: [],
	};

	componentsActions.setOverridableProps( componentId, {
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
