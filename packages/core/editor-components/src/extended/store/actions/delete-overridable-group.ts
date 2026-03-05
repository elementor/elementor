import { componentsActions } from '../../../store/dispatchers';
import { componentsSelectors } from '../../../store/selectors';
import { type ComponentId } from '../../../types';
import { deleteGroup } from '../utils/groups-transformers';

type DeleteGroupParams = {
	componentId: ComponentId;
	groupId: string;
};

export function deleteOverridableGroup( { componentId, groupId }: DeleteGroupParams ): boolean {
	const overridableProps = componentsSelectors.getOverridableProps( componentId );

	if ( ! overridableProps ) {
		return false;
	}

	const group = overridableProps.groups.items[ groupId ];

	if ( ! group || group.props.length > 0 ) {
		return false;
	}

	const updatedGroups = deleteGroup( overridableProps.groups, groupId );

	componentsActions.setOverridableProps( componentId, {
		...overridableProps,
		groups: updatedGroups,
	} );

	return true;
}
