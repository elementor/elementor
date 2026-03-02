import { componentsStore } from '../../../store/dispatchers';
import { type ComponentId } from '../../../types';

type ReorderGroupsParams = {
	componentId: ComponentId;
	newOrder: string[];
};

export function reorderOverridableGroups( { componentId, newOrder }: ReorderGroupsParams ): void {
	const overridableProps = componentsStore.getOverridableProps( componentId );

	if ( ! overridableProps ) {
		return;
	}

	componentsStore.setOverridableProps( componentId, {
		...overridableProps,
		groups: {
			...overridableProps.groups,
			order: newOrder,
		},
	} );
}
