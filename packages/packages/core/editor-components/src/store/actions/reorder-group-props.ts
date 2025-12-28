import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { type ComponentId } from '../../types';
import { selectOverridableProps, slice } from '../store';

type ReorderGroupPropsParams = {
	componentId: ComponentId;
	groupId: string;
	newPropsOrder: string[];
};

export function reorderGroupProps( { componentId, groupId, newPropsOrder }: ReorderGroupPropsParams ): void {
	const overridableProps = selectOverridableProps( getState(), componentId );

	if ( ! overridableProps ) {
		return;
	}

	const group = overridableProps.groups.items[ groupId ];

	if ( ! group ) {
		return;
	}

	dispatch(
		slice.actions.setOverridableProps( {
			componentId,
			overridableProps: {
				...overridableProps,
				groups: {
					...overridableProps.groups,
					items: {
						...overridableProps.groups.items,
						[ groupId ]: {
							...group,
							props: newPropsOrder,
						},
					},
				},
			},
		} )
	);
}
