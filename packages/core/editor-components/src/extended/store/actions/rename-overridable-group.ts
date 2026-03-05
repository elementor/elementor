import { componentsActions } from '../../../store/dispatchers';
import { componentsSelectors } from '../../../store/selectors';
import { type ComponentId } from '../../../types';
import { renameGroup } from '../utils/groups-transformers';

type RenameGroupParams = {
	componentId: ComponentId;
	groupId: string;
	label: string;
};

export function renameOverridableGroup({ componentId, groupId, label }: RenameGroupParams): boolean {
	const overridableProps = componentsSelectors.getOverridableProps(componentId);

	if (!overridableProps) {
		return false;
	}

	const group = overridableProps.groups.items[groupId];

	if (!group) {
		return false;
	}

	const updatedGroups = renameGroup(overridableProps.groups, groupId, label);

	componentsActions.setOverridableProps(componentId, {
		...overridableProps,
		groups: updatedGroups,
	});

	return true;
}
