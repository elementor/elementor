import { componentsStore } from '../../../store/dispatchers';
import { type ComponentId } from '../../../types';
import { renameGroup } from '../utils/groups-transformers';

type RenameGroupParams = {
	componentId: ComponentId;
	groupId: string;
	label: string;
};

export function renameOverridableGroup( { componentId, groupId, label }: RenameGroupParams ): boolean {
	const overridableProps = componentsStore.getOverridableProps( componentId );

	if ( ! overridableProps ) {
		return false;
	}

	const group = overridableProps.groups.items[ groupId ];

	if ( ! group ) {
		return false;
	}

	const updatedGroups = renameGroup( overridableProps.groups, groupId, label );

	componentsStore.setOverridableProps( componentId, {
		...overridableProps,
		groups: updatedGroups,
	} );

	return true;
}
