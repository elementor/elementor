import * as React from 'react';
import { useState } from 'react';
import { PanelBody, PanelHeader, PanelHeaderTitle } from '@elementor/editor-panels';
import { ComponentPropListIcon, PlusIcon, XIcon } from '@elementor/icons';
import { __getState as getState, __useDispatch as useDispatch, __useSelector as useSelector } from '@elementor/store';
import {
	Divider,
	IconButton,
	Stack,
	Tooltip,
	UnstableSortableItem,
	type UnstableSortableItemRenderProps,
	UnstableSortableProvider,
} from '@elementor/ui';
import { generateUniqueId } from '@elementor/utils';
import { __ } from '@wordpress/i18n';

import { selectCurrentComponentId, selectOverridableProps, slice } from '../../store/store';
import { type OverridablePropsGroup } from '../../types';
import { PropertiesGroup } from './properties-group';

export function ComponentPropertiesPanel( { onClose }: { onClose: () => void } ) {
	const dispatch = useDispatch();
	const currentComponentId = useSelector( selectCurrentComponentId );

	const overridableProps = currentComponentId ? selectOverridableProps( getState(), currentComponentId ) : null;

	const [ groupsOrder, setGroupsOrder ] = useState< string[] >( [] );
	const [ editingGroupId, setEditingGroupId ] = useState< string | null >( null );
	const [ draftGroups, setDraftGroups ] = useState< Record< string, OverridablePropsGroup > >( {} );

	const handleClose = () => {
		onClose();
	};

	if ( ! currentComponentId || ! overridableProps ) {
		return null;
	}

	const orderedGroupIds = groupsOrder.length > 0 ? groupsOrder : overridableProps.groups.order;

	const groupsItems = {
		...overridableProps.groups.items,
		...draftGroups,
	};

	const groups = orderedGroupIds
		.map( ( groupId ) => groupsItems[ groupId ] ?? null )
		.filter( ( group ): group is NonNullable< typeof group > => group !== null );

	const handleReorder = ( newOrder: string[] ) => {
		setGroupsOrder( newOrder );
	};

	const validateGroupLabel = ( groupId: string, label: string ): string | null => {
		const trimmedLabel = label.trim();

		if ( trimmedLabel.length === 0 ) {
			return __( 'Group name is required', 'elementor' );
		}

		const otherLabels = Object.entries( groupsItems )
			.filter( ( [ id ] ) => id !== groupId )
			.map( ( [ , group ] ) => group.label );

		if ( otherLabels.includes( trimmedLabel ) ) {
			return __( 'Group name must be unique', 'elementor' );
		}

		return null;
	};

	const handleCreateGroup = () => {
		const groupId = generateUniqueId( 'group' );

		setDraftGroups( ( prev ) => ( {
			...prev,
			[ groupId ]: {
				id: groupId,
				label: '',
				props: [],
			},
		} ) );

		setGroupsOrder( ( prev ) => {
			const base = prev.length > 0 ? prev : orderedGroupIds;

			return base.includes( groupId ) ? base : [ groupId, ...base ];
		} );

		setEditingGroupId( groupId );
	};

	const handleRenameDraftGroup = ( groupId: string, label: string ) => {
		const trimmedLabel = label.trim();
		const baseOrder = groupsOrder.length > 0 ? groupsOrder : overridableProps.groups.order;
		const order = baseOrder.includes( groupId ) ? baseOrder : [ ...baseOrder, groupId ];

		dispatch(
			slice.actions.setOverridableProps( {
				componentId: currentComponentId,
				overridableProps: {
					...overridableProps,
					groups: {
						items: {
							...overridableProps.groups.items,
							[ groupId ]: {
								id: groupId,
								label: trimmedLabel,
								props: [],
							},
						},
						order,
					},
				},
			} )
		);

		setDraftGroups( ( prev ) => {
			const { [ groupId ]: _removed, ...rest } = prev;

			return rest;
		} );

		setEditingGroupId( null );
	};

	return (
		<>
			<PanelHeader>
				<Stack direction="row" alignItems="center" gap={ 1 } flexGrow={ 1 }>
					<ComponentPropListIcon fontSize="tiny" />
					<PanelHeaderTitle>{ __( 'Component properties', 'elementor' ) }</PanelHeaderTitle>
				</Stack>
				<Stack direction="row" alignItems="center" gap={ 0.5 }>
					<Tooltip title={ __( 'Add group', 'elementor' ) }>
						<IconButton
							size="tiny"
							aria-label={ __( 'Add group', 'elementor' ) }
							onClick={ handleCreateGroup }
						>
							<PlusIcon fontSize="tiny" />
						</IconButton>
					</Tooltip>
					<Tooltip title={ __( 'Close panel', 'elementor' ) }>
						<IconButton size="tiny" aria-label={ __( 'Close panel', 'elementor' ) } onClick={ handleClose }>
							<XIcon fontSize="tiny" />
						</IconButton>
					</Tooltip>
				</Stack>
			</PanelHeader>
			<Divider />
			<PanelBody>
				<UnstableSortableProvider
					value={ orderedGroupIds }
					onChange={ handleReorder }
					variant="static"
					restrictAxis
				>
					{ groups.map( ( group ) => (
						<UnstableSortableItem
							key={ group.id }
							id={ group.id }
							render={ ( { itemProps, itemStyle, triggerStyle }: UnstableSortableItemRenderProps ) => (
								<div { ...itemProps } style={ { ...itemStyle, ...triggerStyle } }>
									<PropertiesGroup
										group={ group }
										props={ overridableProps.props }
										allowEmpty={ group.id in draftGroups }
										isEditing={ editingGroupId === group.id }
										onRename={
											group.id in draftGroups
												? ( label: string ) => handleRenameDraftGroup( group.id, label )
												: undefined
										}
										validateLabel={
											group.id in draftGroups
												? ( label: string ) => validateGroupLabel( group.id, label )
												: undefined
										}
									/>
								</div>
							) }
						/>
					) ) }
				</UnstableSortableProvider>
			</PanelBody>
		</>
	);
}
