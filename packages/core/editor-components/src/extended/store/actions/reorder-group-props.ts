import { componentsActions } from '../../../store/dispatchers';
import { componentsSelectors } from '../../../store/selectors';
import { type ComponentId } from '../../../types';

type ReorderGroupPropsParams = {
	componentId: ComponentId;
	groupId: string;
	newPropsOrder: string[];
};

export function reorderGroupProps({ componentId, groupId, newPropsOrder }: ReorderGroupPropsParams): void {
	const overridableProps = componentsSelectors.getOverridableProps(componentId);

	if (!overridableProps) {
		return;
	}

	const group = overridableProps.groups.items[groupId];

	if (!group) {
		return;
	}

	componentsActions.setOverridableProps(componentId, {
		...overridableProps,
		groups: {
			...overridableProps.groups,
			items: {
				...overridableProps.groups.items,
				[groupId]: {
					...group,
					props: newPropsOrder,
				},
			},
		},
	});
}
