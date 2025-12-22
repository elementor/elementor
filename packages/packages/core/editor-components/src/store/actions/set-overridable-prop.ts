import { type PropValue } from '@elementor/editor-props';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';
import { generateUniqueId } from '@elementor/utils';

import { type OverridableProp } from '../../types';
import { selectOverridableProps, slice } from '../store';
import {
	addPropToGroup,
	ensureGroupInOrder,
	removePropFromGroup,
	removePropsFromState,
	resolveOrCreateGroup,
} from '../utils/overridable-props-transforms';

type Props = {
	componentId: number;
	overrideKey: string | null;
	elementId: string;
	label: string;
	groupId: string | null;
	propKey: string;
	elType: string;
	widgetType: string;
	originValue: PropValue;
};

export function setOverridableProp( {
	componentId,
	overrideKey,
	elementId,
	label,
	groupId,
	propKey,
	elType,
	widgetType,
	originValue,
}: Props ): OverridableProp | undefined {
	const overridableProps = selectOverridableProps( getState(), componentId );

	if ( ! overridableProps ) {
		return;
	}

	const existingOverridableProp = overrideKey ? overridableProps.props[ overrideKey ] : null;
	const duplicatedTargetProps = Object.values( overridableProps.props ).filter(
		( prop ) => prop.elementId === elementId && prop.propKey === propKey && prop !== existingOverridableProp
	);

	const { groups: groupsAfterResolve, groupId: currentGroupId } = resolveOrCreateGroup(
		overridableProps.groups,
		groupId || existingOverridableProp?.groupId || undefined
	);

	const overridableProp: OverridableProp = {
		overrideKey: existingOverridableProp?.overrideKey || generateUniqueId( 'prop' ),
		label,
		elementId,
		propKey,
		widgetType,
		elType,
		originValue,
		groupId: currentGroupId,
	};

	const stateAfterRemovingDuplicates = removePropsFromState(
		{ ...overridableProps, groups: groupsAfterResolve },
		duplicatedTargetProps
	);

	const props = {
		...stateAfterRemovingDuplicates.props,
		[ overridableProp.overrideKey ]: overridableProp,
	};

	let groups = addPropToGroup( stateAfterRemovingDuplicates.groups, currentGroupId, overridableProp.overrideKey );
	groups = ensureGroupInOrder( groups, currentGroupId );

	const isChangingGroups = existingOverridableProp && existingOverridableProp.groupId !== currentGroupId;

	if ( isChangingGroups ) {
		groups = removePropFromGroup( groups, existingOverridableProp.groupId, overridableProp.overrideKey );
	}

	dispatch(
		slice.actions.setOverridableProps( {
			componentId,
			overridableProps: {
				props,
				groups,
			},
		} )
	);

	return overridableProp;
}
