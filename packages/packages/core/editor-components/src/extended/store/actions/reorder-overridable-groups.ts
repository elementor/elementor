import { componentsActions } from '../../../store/dispatchers';
import { componentsSelectors } from '../../../store/selectors';
import { type ComponentId } from '../../../types';

type ReorderGroupsParams = {
	componentId: ComponentId;
	newOrder: string[];
};

export function reorderOverridableGroups({ componentId, newOrder }: ReorderGroupsParams): void {
	const overridableProps = componentsSelectors.getOverridableProps(componentId);

	if (!overridableProps) {
		return;
	}

	componentsActions.setOverridableProps(componentId, {
		...overridableProps,
		groups: {
			...overridableProps.groups,
			order: newOrder,
		},
	});
}
