import { componentsActions } from '../../../store/dispatchers';
import { componentsSelectors } from '../../../store/selectors';
import { type ComponentId, type OverridableProp } from '../../../types';
import { movePropBetweenGroups } from '../utils/groups-transformers';

type UpdatePropParams = {
	componentId: ComponentId;
	overrideKey: string;
	label: string;
	groupId: string | null;
};

export function updateOverridablePropParams( {
	componentId,
	overrideKey,
	label,
	groupId,
}: UpdatePropParams ): OverridableProp | undefined {
	const overridableProps = componentsSelectors.getOverridableProps( componentId );

	if ( ! overridableProps ) {
		return;
	}

	const prop = overridableProps.props[ overrideKey ];

	if ( ! prop ) {
		return;
	}

	const oldGroupId = prop.groupId;
	const newGroupId = groupId ?? oldGroupId;

	const updatedProp: OverridableProp = {
		...prop,
		label,
		groupId: newGroupId,
	};

	const updatedGroups = movePropBetweenGroups( overridableProps.groups, overrideKey, oldGroupId, newGroupId );

	componentsActions.setOverridableProps( componentId, {
		...overridableProps,
		props: {
			...overridableProps.props,
			[ overrideKey ]: updatedProp,
		},
		groups: updatedGroups,
	} );

	return updatedProp;
}
