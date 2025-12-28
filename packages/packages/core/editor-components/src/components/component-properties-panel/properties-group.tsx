import * as React from 'react';
import { EditableField, MenuListItem } from '@elementor/editor-ui';
import { DotsVerticalIcon } from '@elementor/icons';
import {
	bindMenu,
	bindTrigger,
	Box,
	IconButton,
	List,
	Menu,
	Stack,
	Tooltip,
	Typography,
	usePopupState,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type OverridableProp, type OverridablePropsGroup } from '../../types';
import { type GroupLabelEditableState } from './hooks/use-current-editable-item';
import { PropertyItem } from './property-item';
import { SortableItem, SortableProvider, SortableTrigger, type SortableTriggerProps } from './sortable';

type Props = {
	group: OverridablePropsGroup;
	props: Record< string, OverridableProp >;
	allGroups: { value: string; label: string }[];
	allGroupsRecord: Record< string, OverridablePropsGroup >;
	sortableTriggerProps: SortableTriggerProps;
	isDragPlaceholder?: boolean;
	setIsAddingGroup: ( isAddingGroup: boolean ) => void;
	onPropsReorder: ( newOrder: string[] ) => void;
	onPropertyDelete: ( propKey: string ) => void;
	onPropertyUpdate: ( propKey: string, data: { label: string; group: string | null } ) => void;
	onGroupDelete: ( groupId: string ) => void;
	editableLabelProps: GroupLabelEditableState;
};

export function PropertiesGroup( {
	group,
	props,
	allGroups,
	sortableTriggerProps,
	isDragPlaceholder,
	onPropsReorder,
	onPropertyDelete,
	onPropertyUpdate,
	onGroupDelete,
	editableLabelProps,
}: Props ) {
	const groupProps = group.props
		.map( ( propId ) => props[ propId ] )
		.filter( ( prop ): prop is OverridableProp => Boolean( prop ) );

	const popupState = usePopupState( {
		variant: 'popover',
		disableAutoFocus: true,
	} );

	const { editableRef, isEditing, error, getEditableProps, setEditingGroupId, editingGroupId } = editableLabelProps;

	const hasProperties = group.props.length > 0;
	const isThisGroupEditing = isEditing && editingGroupId === group.id;

	const handleRenameClick = () => {
		popupState.close();
		setEditingGroupId( group.id );
	};

	const handleDeleteClick = () => {
		popupState.close();
		onGroupDelete( group.id );
	};

	return (
		<Box
			sx={ {
				opacity: isDragPlaceholder ? 0.5 : 1,
			} }
		>
			<Stack gap={ 1 }>
				<Box
					className="group-header"
					sx={ {
						position: 'relative',
						'&:hover .group-sortable-trigger': {
							visibility: 'visible',
						},
						'& .group-sortable-trigger': {
							visibility: 'hidden',
						},
						'&:hover .group-menu': {
							visibility: 'visible',
						},
						'& .group-menu': {
							visibility: 'hidden',
						},
					} }
				>
					<SortableTrigger triggerClassName="group-sortable-trigger" { ...sortableTriggerProps } />
					<Stack direction="row" alignItems="center" justifyContent="space-between" gap={ 2 }>
						{ isThisGroupEditing ? (
							<Box
								sx={ {
									flex: 1,
									height: 28,
									display: 'flex',
									alignItems: 'center',
									border: 2,
									borderColor: 'text.secondary',
									borderRadius: 1,
									pl: 0.5,
								} }
							>
								<EditableField
									ref={ editableRef }
									as={ Typography }
									variant="caption"
									error={ error ?? undefined }
									sx={ { color: 'text.primary', fontWeight: 400, lineHeight: 1.66 } }
									{ ...getEditableProps() }
								/>
							</Box>
						) : (
							<Typography
								variant="caption"
								sx={ { color: 'text.primary', fontWeight: 400, lineHeight: 1.66 } }
							>
								{ group.label }
							</Typography>
						) }
						<IconButton
							className="group-menu"
							size="tiny"
							sx={ { p: 0.25, visibility: isThisGroupEditing ? 'visible' : undefined } }
							aria-label={ __( 'Group actions', 'elementor' ) }
							{ ...bindTrigger( popupState ) }
						>
							<DotsVerticalIcon fontSize="tiny" />
						</IconButton>
					</Stack>
				</Box>
				<List sx={ { p: 0, display: 'flex', flexDirection: 'column', gap: 1 } }>
					<SortableProvider value={ group.props } onChange={ onPropsReorder }>
						{ groupProps.map( ( prop ) => (
							<SortableItem key={ prop.overrideKey } id={ prop.overrideKey }>
								{ ( { triggerProps, triggerStyle, isDragPlaceholder: isItemDragPlaceholder } ) => (
									<PropertyItem
										prop={ prop }
										sortableTriggerProps={ { ...triggerProps, style: triggerStyle } }
										isDragPlaceholder={ isItemDragPlaceholder }
										groups={ allGroups }
										onDelete={ onPropertyDelete }
										onUpdate={ ( data ) => onPropertyUpdate( prop.overrideKey, data ) }
									/>
								) }
							</SortableItem>
						) ) }
					</SortableProvider>
				</List>
			</Stack>
			<Menu
				{ ...bindMenu( popupState ) }
				anchorOrigin={ { vertical: 'bottom', horizontal: 'right' } }
				transformOrigin={ { vertical: 'top', horizontal: 'right' } }
			>
				<MenuListItem sx={ { minWidth: '160px' } } onClick={ handleRenameClick }>
					<Typography variant="caption" sx={ { color: 'text.primary' } }>
						{ __( 'Rename', 'elementor' ) }
					</Typography>
				</MenuListItem>
				<Tooltip
					title={
						hasProperties ? __( 'To delete the group, first remove all the properties', 'elementor' ) : ''
					}
					placement="right"
				>
					<span>
						<MenuListItem onClick={ handleDeleteClick } disabled={ hasProperties }>
							<Typography
								variant="caption"
								sx={ { color: hasProperties ? 'text.disabled' : 'error.light' } }
							>
								{ __( 'Delete', 'elementor' ) }
							</Typography>
						</MenuListItem>
					</span>
				</Tooltip>
			</Menu>
		</Box>
	);
}
