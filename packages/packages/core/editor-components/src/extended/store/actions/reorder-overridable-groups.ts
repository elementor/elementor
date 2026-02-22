import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { selectOverridableProps, slice } from '../../../store/store';
import { type ComponentId } from '../../../types';

type ReorderGroupsParams = {
	componentId: ComponentId;
	newOrder: string[];
};

export function reorderOverridableGroups( { componentId, newOrder }: ReorderGroupsParams ): void {
	const overridableProps = selectOverridableProps( getState(), componentId );

	if ( ! overridableProps ) {
		return;
	}

	dispatch(
		slice.actions.setOverridableProps( {
			componentId,
			overridableProps: {
				...overridableProps,
				groups: {
					...overridableProps.groups,
					order: newOrder,
				},
			},
		} )
	);
}
