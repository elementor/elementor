import { useState } from 'react';
import type * as React from 'react';
import { setDocumentModifiedStatus } from '@elementor/editor-documents';
import { useEditable } from '@elementor/editor-ui';

import { renameOverridableGroup } from '../../../store/actions/rename-overridable-group';
import { useCurrentComponentId } from '../../../store/store';
import { useOverridableProps } from '../../component-panel-header/use-overridable-props';
import { validateGroupLabel } from '../utils/validate-group-label';

export type GroupLabelEditableState = {
	editableRef: React.RefObject< HTMLElement | null >;
	isEditing: boolean;
	error: string | null;
	getEditableProps: () => { value: string };
	setEditingGroupId: ( groupId: string ) => void;
	editingGroupId: string | null;
};

export function useCurrentEditableItem(): GroupLabelEditableState {
	const [ editingGroupId, setEditingGroupId ] = useState< string | null >( null );
	const currentComponentId = useCurrentComponentId();
	const overridableProps = useOverridableProps( currentComponentId );

	const allGroupsRecord = overridableProps?.groups?.items ?? {};
	const currentGroup = editingGroupId ? allGroupsRecord[ editingGroupId ] : null;

	const validateLabel = ( newLabel: string ): string | null => {
		const otherGroups = Object.fromEntries(
			Object.entries( allGroupsRecord ).filter( ( [ id ] ) => id !== editingGroupId )
		);

		return validateGroupLabel( newLabel, otherGroups ) || null;
	};

	const handleSubmit = ( newLabel: string ) => {
		if ( ! editingGroupId || ! currentComponentId ) {
			return;
		}

		renameOverridableGroup( {
			componentId: currentComponentId,
			groupId: editingGroupId,
			label: newLabel,
		} );

		setDocumentModifiedStatus( true );
	};

	const {
		ref: editableRef,
		openEditMode,
		isEditing,
		error,
		getProps: getEditableProps,
	} = useEditable( {
		value: currentGroup?.label ?? '',
		onSubmit: handleSubmit,
		validation: validateLabel,
	} );

	return {
		editableRef,
		isEditing,
		error,
		getEditableProps,
		setEditingGroupId: ( groupId ) => {
			setEditingGroupId( groupId );
			openEditMode();
		},
		editingGroupId,
	};
}
