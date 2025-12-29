import { generateUniqueId } from '@elementor/utils';
import { __ } from '@wordpress/i18n';

import { type OverridableProp, type OverridableProps, type OverridablePropsGroup } from '../../types';

type Groups = OverridableProps[ 'groups' ];

export function removePropFromAllGroups( groups: Groups, propKey: string ): Groups {
	return {
		...groups,
		items: Object.fromEntries(
			Object.entries( groups.items ).map( ( [ groupId, group ] ) => [
				groupId,
				{
					...group,
					props: group.props.filter( ( p ) => p !== propKey ),
				},
			] )
		),
	};
}

export function addPropToGroup( groups: Groups, groupId: string, propKey: string ): Groups {
	const group = groups.items[ groupId ];

	if ( ! group ) {
		return groups;
	}

	if ( group.props.includes( propKey ) ) {
		return groups;
	}

	return {
		...groups,
		items: {
			...groups.items,
			[ groupId ]: {
				...group,
				props: [ ...group.props, propKey ],
			},
		},
	};
}

export function movePropBetweenGroups(
	groups: Groups,
	propKey: string,
	fromGroupId: string,
	toGroupId: string
): Groups {
	if ( fromGroupId === toGroupId ) {
		return groups;
	}

	const withoutProp = removePropFromGroup( groups, fromGroupId, propKey );
	return addPropToGroup( withoutProp, toGroupId, propKey );
}

export function removePropFromGroup( groups: Groups, groupId: string, propKey: string ): Groups {
	const group = groups.items[ groupId ];

	if ( ! group ) {
		return groups;
	}

	return {
		...groups,
		items: {
			...groups.items,
			[ groupId ]: {
				...group,
				props: group.props.filter( ( p ) => p !== propKey ),
			},
		},
	};
}

type ResolvedGroup = {
	groups: Groups;
	groupId: string;
};

export function resolveOrCreateGroup( groups: Groups, requestedGroupId?: string ): ResolvedGroup {
	if ( requestedGroupId && groups.items[ requestedGroupId ] ) {
		return { groups, groupId: requestedGroupId };
	}

	if ( ! requestedGroupId && groups.order.length > 0 ) {
		return { groups, groupId: groups.order[ 0 ] };
	}

	return createGroup( groups, requestedGroupId );
}

export function createGroup( groups: Groups, groupId?: string, label?: string ): ResolvedGroup {
	const newGroupId = groupId || generateUniqueId( 'group' );
	const newLabel = label || __( 'Default', 'elementor' );

	return {
		groups: {
			...groups,
			items: {
				...groups.items,
				[ newGroupId ]: {
					id: newGroupId,
					label: newLabel,
					props: [],
				},
			},
			order: [ ...groups.order, newGroupId ],
		},
		groupId: newGroupId,
	};
}

export function removePropsFromState(
	overridableProps: OverridableProps,
	propsToRemove: OverridableProp[]
): OverridableProps {
	const overrideKeysToRemove = propsToRemove.map( ( prop ) => prop.overrideKey );

	const remainingProps = Object.fromEntries(
		Object.entries( overridableProps.props ).filter( ( [ , prop ] ) => ! propsToRemove.includes( prop ) )
	);

	const updatedGroupItems = Object.fromEntries(
		Object.entries( overridableProps.groups.items ).map(
			( [ groupId, group ]: [ string, OverridablePropsGroup ] ) => [
				groupId,
				{
					...group,
					props: group.props.filter( ( prop ) => ! overrideKeysToRemove.includes( prop ) ),
				},
			]
		)
	);

	return {
		props: remainingProps,
		groups: {
			items: updatedGroupItems,
			order: overridableProps.groups.order.filter( ( groupId ) => ! overrideKeysToRemove.includes( groupId ) ),
		},
	};
}

export function ensureGroupInOrder( groups: Groups, groupId: string ): Groups {
	if ( groups.order.includes( groupId ) ) {
		return groups;
	}

	return {
		...groups,
		order: [ ...groups.order, groupId ],
	};
}

export function deleteGroup( groups: Groups, groupId: string ): Groups {
	const { [ groupId ]: removed, ...remainingItems } = groups.items;

	return {
		items: remainingItems,
		order: groups.order.filter( ( id ) => id !== groupId ),
	};
}

export function renameGroup( groups: Groups, groupId: string, newLabel: string ): Groups {
	const group = groups.items[ groupId ];

	if ( ! group ) {
		return groups;
	}

	return {
		...groups,
		items: {
			...groups.items,
			[ groupId ]: {
				...group,
				label: newLabel,
			},
		},
	};
}
