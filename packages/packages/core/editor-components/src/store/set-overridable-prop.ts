import { type PropValue } from '@elementor/editor-props';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';
import { generateUniqueId } from '@elementor/utils';
import { __ } from '@wordpress/i18n';

import { getOverridableProp } from '../components/overridable-props/utils/get-overridable-prop';
import { type OverridableProp, type OverridablePropGroup, type OverridableProps } from '../types';
import { selectOverridableProps, slice } from './store';

export function setOverridableProp(
	componentId: number,
	elementId: string,
	label: string,
	groupId: string | null,
	propKey: string,
	widgetType: string,
	defaultValue: PropValue
): OverridableProp | undefined {
	const overridableProps = selectOverridableProps( getState(), componentId );

	if ( ! overridableProps ) {
		return;
	}

	const existingOverridableProp = getOverridableProp( {
		componentId,
		elementId,
		propKey,
		widgetType,
	} );

	let currentGroupId = groupId || existingOverridableProp?.groupId;

	const { props, groups } = { ...overridableProps };

	const updatedGroups = { ...groups };

	if ( ! currentGroupId || ! updatedGroups.items[ currentGroupId ] ) {
		currentGroupId = addNewGroup( updatedGroups, currentGroupId );
	}

	const overridableProp = {
		'override-key': existingOverridableProp?.[ 'override-key' ] || generateUniqueId(),
		label,
		elementId,
		propKey,
		widgetType,
		defaultValue,
		groupId: currentGroupId,
	};

	const group: OverridablePropGroup = updatedGroups.items[ currentGroupId ];

	if ( existingOverridableProp && existingOverridableProp.groupId !== currentGroupId ) {
		const oldGroup = updatedGroups.items[ existingOverridableProp.groupId ];

		if ( oldGroup ) {
			oldGroup.props = oldGroup.props.filter( ( key ) => key !== overridableProp[ 'override-key' ] );
		}
	}

	if ( ! group.props.includes( overridableProp[ 'override-key' ] ) ) {
		group.props.push( overridableProp[ 'override-key' ] );
	}

	const newOverridableProps = {
		props: {
			...props,
			[ overridableProp[ 'override-key' ] ]: overridableProp,
		},
		groups: {
			items: {
				...updatedGroups.items,
				[ currentGroupId ]: group,
			},
			order: updatedGroups.order.includes( currentGroupId )
				? updatedGroups.order
				: [ ...updatedGroups.order, currentGroupId ],
		},
	} satisfies OverridableProps;

	dispatch(
		slice.actions.setOverridableProps( {
			componentId,
			overrides: newOverridableProps,
		} )
	);

	return overridableProp;
}

function addNewGroup( groups: OverridableProps[ 'groups' ], groupId: string | undefined ): string {
	const currentGroupId = groupId || generateUniqueId();

	groups.items = {
		...groups.items,
		[ currentGroupId ]: {
			id: currentGroupId,
			label: __( 'Default', 'elementor' ),
			props: [],
		},
	};

	groups.order = [ ...groups.order, currentGroupId ];

	return currentGroupId;
}
