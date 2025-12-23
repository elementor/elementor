import * as React from 'react';
import { EditableField, MenuListItem, useEditable } from '@elementor/editor-ui';
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
import { PropertyItem } from './property-item';
import { SortableItem, SortableProvider, SortableTrigger, type SortableTriggerProps } from './sortable';
import { validateGroupLabel } from './utils/validate-group-label';

type Props = {
	group: OverridablePropsGroup;
	props: Record< string, OverridableProp >;
	allGroups: { value: string; label: string }[];
	allGroupsRecord: Record< string, OverridablePropsGroup >;
	sortableTriggerProps: SortableTriggerProps;
	isDragPlaceholder?: boolean;
	onPropsReorder: ( newOrder: string[] ) => void;
	onPropertyDelete: ( propKey: string ) => void;
	onPropertyUpdate: ( propKey: string, data: { label: string; group: string | null } ) => void;
	onGroupRename: ( groupId: string, label: string ) => void;
	onGroupDelete: ( groupId: string ) => void;
};

export function PropertiesGroup( {
	group,
	props,
	allGroups,
	allGroupsRecord,
	sortableTriggerProps,
	isDragPlaceholder,
	onPropsReorder,
	onPropertyDelete,
	onPropertyUpdate,
	onGroupRename,
	onGroupDelete,
}: Props ) {
	const groupProps = group.props
		.map( ( propId ) => props[ propId ] )
		.filter( ( prop ): prop is OverridableProp => Boolean( prop ) );

	const popupState = usePopupState( {
		variant: 'popover',
		disableAutoFocus: true,
	} );

	const validateLabel = ( newLabel: string ) => {
		const otherGroups = Object.fromEntries(
			Object.entries( allGroupsRecord ).filter( ( [ id ] ) => id !== group.id )
		);
		const error = validateGroupLabel( newLabel, otherGroups );
		return error || null;
	};

	const {
		ref: editableRef,
		openEditMode,
		isEditing,
		error,
		getProps: getEditableProps,
	} = useEditable( {
		value: group.label,
		onSubmit: ( newLabel ) => onGroupRename( group.id, newLabel ),
		validation: validateLabel,
	} );

	const hasProperties = group.props.length > 0;

	const handleRenameClick = () => {
		popupState.close();
		openEditMode();
	};

	const handleDeleteClick = () => {
		popupState.close();
		onGroupDelete( group.id );
	};

	return (
		<Box
			sx={ {
				opacity: isDragPlaceholder ? 0.5 : 1,
				'&:hover .sortable-trigger': {
					visibility: 'visible',
				},
				'& .sortable-trigger': {
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
			<Stack gap={ 1 }>
				<Box sx={ { position: 'relative', pl: 1 } }>
					<SortableTrigger { ...sortableTriggerProps } />
					<Stack direction="row" alignItems="center" justifyContent="space-between" gap={ 2 }>
						{ isEditing ? (
							<Box
								sx={ {
									flex: 1,
									height: 28,
									display: 'flex',
									alignItems: 'center',
									border: 2,
									borderColor: 'text.secondary',
									borderRadius: 2,
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
							sx={ { p: 0.25, visibility: isEditing ? 'visible' : undefined } }
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
