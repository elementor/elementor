import { type PropValue } from '@elementor/editor-props';
import { generateUniqueId } from '@elementor/utils';

import { componentsStore } from '../../../store/dispatchers';
import { type OriginPropFields, type OverridableProp } from '../../../types';
import { type Source, trackComponentEvent } from '../../../utils/tracking';
import {
	addPropToGroup,
	ensureGroupInOrder,
	removePropFromGroup,
	removePropsFromState,
	resolveOrCreateGroup,
} from '../utils/groups-transformers';

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
	originPropFields?: OriginPropFields;
	source: Source;
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
	originPropFields,
	source,
}: Props ): OverridableProp | undefined {
	const overridableProps = componentsStore.getOverridableProps( componentId );

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
		originPropFields,
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

	componentsStore.setOverridableProps( componentId, { props, groups } );

	const isNewProperty = ! existingOverridableProp;

	if ( isNewProperty ) {
		const currentComponent = componentsStore.getCurrentComponent();

		trackComponentEvent( {
			action: 'propertyExposed',
			source,
			component_uid: currentComponent?.uid,
			property_id: overridableProp.overrideKey,
			property_path: propKey,
			property_name: label,
			element_type: widgetType ?? elType,
		} );
	}

	return overridableProp;
}
