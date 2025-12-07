import { type PropValue } from '@elementor/editor-props';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';
import { generateUniqueId } from '@elementor/utils';
import { __ } from '@wordpress/i18n';

import { type OverridableProp, type OverridableProps, type OverridablePropsGroup } from '../../types';
import { selectOverridableProps, slice } from '../store';

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

	const { props: prevProps, groups: prevGroups } = { ...overridableProps };

	const { groups: updatedGroups, currentGroupId } = getUpdatedGroups(
		prevGroups,
		groupId || existingOverridableProp?.groupId
	);

	const overridableProp = {
		overrideKey: existingOverridableProp?.overrideKey || generateUniqueId( 'prop' ),
		label,
		elementId,
		propKey,
		widgetType,
		elType,
		originValue,
		groupId: currentGroupId,
	};

	const { props: propsWithoutDuplicates, groups: groupsWithoutDuplicates } = removeProps( {
		props: prevProps,
		groups: updatedGroups,
		propsToRemove: duplicatedTargetProps,
	} );

	const props = {
		...propsWithoutDuplicates,
		[ overridableProp.overrideKey ]: overridableProp,
	};

	const groups = {
		items: {
			...groupsWithoutDuplicates.items,
			[ currentGroupId ]: getGroupWithProp( groupsWithoutDuplicates, currentGroupId, overridableProp ),
		},
		order: groupsWithoutDuplicates.order.includes( currentGroupId )
			? groupsWithoutDuplicates.order
			: [ ...groupsWithoutDuplicates.order, currentGroupId ],
	};

	const isChangingGroups = existingOverridableProp && existingOverridableProp.groupId !== currentGroupId;

	if ( isChangingGroups ) {
		groups.items[ existingOverridableProp.groupId ] = getGroupWithoutProp(
			groupsWithoutDuplicates,
			existingOverridableProp.groupId,
			overridableProp
		);
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

type UpdatedGroups = { groups: OverridableProps[ 'groups' ]; currentGroupId: string };

function getUpdatedGroups( groups: OverridableProps[ 'groups' ], groupId: string | undefined ): UpdatedGroups {
	if ( ! groupId ) {
		// use first existing group
		if ( groups.order.length > 0 ) {
			return { groups, currentGroupId: groups.order[ 0 ] };
		}

		// create the first group (default)
		return addNewGroup( groups );
	}

	if ( ! groups.items[ groupId ] ) {
		// fallback - if for any reason there's no such group - create it
		return addNewGroup( groups, groupId );
	}

	// use the existing group
	return { groups, currentGroupId: groupId };
}

function addNewGroup( groups: OverridableProps[ 'groups' ], groupId?: string | undefined ): UpdatedGroups {
	const currentGroupId = groupId || generateUniqueId( 'group' );
	const updatedGroups = {
		...groups,
		items: {
			...groups.items,
			[ currentGroupId ]: {
				id: currentGroupId,
				label: __( 'Default', 'elementor' ),
				props: [],
			},
		},
		order: [ ...groups.order, currentGroupId ],
	};

	return { groups: updatedGroups, currentGroupId };
}

function getGroupWithProp(
	groups: OverridableProps[ 'groups' ],
	groupId: string,
	overridableProp: OverridableProp
): OverridablePropsGroup {
	const group: OverridablePropsGroup = { ...groups.items[ groupId ] };

	if ( ! group.props.includes( overridableProp.overrideKey ) ) {
		group.props = [ ...group.props, overridableProp.overrideKey ];
	}

	return group;
}

function getGroupWithoutProp(
	groups: OverridableProps[ 'groups' ],
	groupId: string,
	overridableProp: OverridableProp
): OverridablePropsGroup {
	const group = { ...groups.items[ groupId ] };

	if ( group ) {
		group.props = group.props.filter( ( key ) => key !== overridableProp.overrideKey );
	}

	return group;
}

function removeProps( {
	props,
	groups,
	propsToRemove,
}: OverridableProps & { propsToRemove: OverridableProp[] } ): OverridableProps {
	const allProps = Object.fromEntries(
		Object.entries( props ).filter( ( [ , prop ] ) => ! propsToRemove.includes( prop ) )
	);

	const overrideKeysToRemove = propsToRemove.map( ( prop ) => prop.overrideKey );

	const allGroupItems = Object.fromEntries(
		Object.entries( groups.items ).map( ( [ groupId, group ]: [ string, OverridablePropsGroup ] ) => [
			groupId,
			{
				...group,
				props: group.props.filter( ( prop ) => ! overrideKeysToRemove.includes( prop ) ),
			},
		] )
	);

	return {
		props: allProps,
		groups: {
			items: allGroupItems,
			order: groups.order.filter( ( groupId ) => ! overrideKeysToRemove.includes( groupId ) ),
		},
	};
}
