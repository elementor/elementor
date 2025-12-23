import * as React from 'react';
import { useState } from 'react';
import { setDocumentModifiedStatus } from '@elementor/editor-documents';
import { PanelBody, PanelHeader, PanelHeaderTitle } from '@elementor/editor-panels';
import { ComponentPropListIcon, FolderIcon, XIcon } from '@elementor/icons';
import { Divider, IconButton, List, Stack, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { addOverridableGroup } from '../../store/actions/add-overridable-group';
import { deleteOverridableGroup } from '../../store/actions/delete-overridable-group';
import { deleteOverridableProp } from '../../store/actions/delete-overridable-prop';
import { renameOverridableGroup } from '../../store/actions/rename-overridable-group';
import { reorderGroupProps } from '../../store/actions/reorder-group-props';
import { reorderOverridableGroups } from '../../store/actions/reorder-overridable-groups';
import { updateOverridableProp } from '../../store/actions/update-overridable-prop';
import { useCurrentComponentId } from '../../store/store';
import { useOverridableProps } from '../component-panel-header/use-overridable-props';
import { NewPropertiesGroup } from './new-properties-group';
import { PropertiesGroup } from './properties-group';
import { SortableItem, SortableProvider } from './sortable';

type Props = {
	onClose: () => void;
};

export function ComponentPropertiesPanelContent( { onClose }: Props ) {
	const currentComponentId = useCurrentComponentId();
	const overridableProps = useOverridableProps( currentComponentId );
	const [ isAddingGroup, setIsAddingGroup ] = useState( false );

	if ( ! currentComponentId || ! overridableProps ) {
		return null;
	}

	const groupIds = overridableProps.groups.order;
	const groups = groupIds
		.map( ( groupId ) => overridableProps.groups.items[ groupId ] ?? null )
		.filter( ( group ): group is NonNullable< typeof group > => group !== null );

	const handleAddGroupClick = () => {
		setIsAddingGroup( true );
	};

	const handleCancelAddGroup = () => {
		setIsAddingGroup( false );
	};

	const handleSaveGroup = ( label: string ) => {
		const newGroupId = `group-${ Date.now() }`;
		addOverridableGroup( { componentId: currentComponentId, groupId: newGroupId, label } );
		setDocumentModifiedStatus( true );
		setIsAddingGroup( false );
	};

	const handleGroupsReorder = ( newOrder: string[] ) => {
		reorderOverridableGroups( { componentId: currentComponentId, newOrder } );
		setDocumentModifiedStatus( true );
	};

	const handlePropsReorder = ( groupId: string, newPropsOrder: string[] ) => {
		reorderGroupProps( { componentId: currentComponentId, groupId, newPropsOrder } );
		setDocumentModifiedStatus( true );
	};

	const handlePropertyDelete = ( propKey: string ) => {
		deleteOverridableProp( { componentId: currentComponentId, propKey } );
		setDocumentModifiedStatus( true );
	};

	const handlePropertyUpdate = ( propKey: string, data: { label: string; group: string | null } ) => {
		updateOverridableProp( {
			componentId: currentComponentId,
			propKey,
			label: data.label,
			groupId: data.group,
		} );
		setDocumentModifiedStatus( true );
	};

	const handleGroupRename = ( groupId: string, label: string ) => {
		renameOverridableGroup( { componentId: currentComponentId, groupId, label } );
		setDocumentModifiedStatus( true );
	};

	const handleGroupDelete = ( groupId: string ) => {
		deleteOverridableGroup( { componentId: currentComponentId, groupId } );
		setDocumentModifiedStatus( true );
	};

	const allGroupsForSelect = groups.map( ( group ) => ( {
		value: group.id,
		label: group.label,
	} ) );

	return (
		<>
			<PanelHeader sx={ { justifyContent: 'start', pl: 1.5, pr: 1, py: 1 } }>
				<Stack direction="row" alignItems="center" gap={ 0.5 } flexGrow={ 1 }>
					<ComponentPropListIcon fontSize="tiny" />
					<PanelHeaderTitle variant="subtitle2">
						{ __( 'Component properties', 'elementor' ) }
					</PanelHeaderTitle>
				</Stack>
				<Tooltip title={ __( 'Add new group', 'elementor' ) }>
					<IconButton
						size="tiny"
						aria-label={ __( 'Add new group', 'elementor' ) }
						onClick={ handleAddGroupClick }
					>
						<FolderIcon fontSize="tiny" />
					</IconButton>
				</Tooltip>
				<Tooltip title={ __( 'Close panel', 'elementor' ) }>
					<IconButton size="tiny" aria-label={ __( 'Close panel', 'elementor' ) } onClick={ onClose }>
						<XIcon fontSize="tiny" />
					</IconButton>
				</Tooltip>
			</PanelHeader>
			<Divider />
			<PanelBody>
				<List sx={ { p: 2, display: 'flex', flexDirection: 'column', gap: 2 } }>
					{ isAddingGroup && (
						<NewPropertiesGroup
							existingGroups={ overridableProps.groups.items }
							onSave={ handleSaveGroup }
							onCancel={ handleCancelAddGroup }
						/>
					) }
					<SortableProvider value={ groupIds } onChange={ handleGroupsReorder }>
						{ groups.map( ( group ) => (
							<SortableItem key={ group.id } id={ group.id }>
								{ ( { triggerProps, triggerStyle, isDragPlaceholder } ) => (
									<PropertiesGroup
										group={ group }
										props={ overridableProps.props }
										allGroups={ allGroupsForSelect }
										allGroupsRecord={ overridableProps.groups.items }
										sortableTriggerProps={ { ...triggerProps, style: triggerStyle } }
										isDragPlaceholder={ isDragPlaceholder }
										onPropsReorder={ ( newOrder ) => handlePropsReorder( group.id, newOrder ) }
										onPropertyDelete={ handlePropertyDelete }
										onPropertyUpdate={ handlePropertyUpdate }
										onGroupRename={ handleGroupRename }
										onGroupDelete={ handleGroupDelete }
									/>
								) }
							</SortableItem>
						) ) }
					</SortableProvider>
				</List>
			</PanelBody>
		</>
	);
}
