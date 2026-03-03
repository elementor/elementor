import * as React from 'react';
import { useRef, useState } from 'react';
import { endDragElementFromPanel, startDragElementFromPanel } from '@elementor/editor-canvas';
import { dropElement, type DropElementParams, type V1ElementData } from '@elementor/editor-elements';
import { MenuListItem, useEditable, WarningInfotip } from '@elementor/editor-ui';
import { DotsVerticalIcon } from '@elementor/icons';
import { bindMenu, bindTrigger, IconButton, Menu, Stack, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import {
	ComponentItem as CoreComponentItem,
	type ComponentItemProps,
	ComponentName,
} from '../../../components/components-tab/components-item';
import { useComponentsPermissions } from '../../../hooks/use-components-permissions';
import { loadComponentsAssets } from '../../../store/actions/load-components-assets';
import { archiveComponent } from '../../store/actions/archive-component';
import { renameComponent } from '../../store/actions/rename-component';
import { validateComponentName } from '../../utils/component-name-validation';
import { createComponentModel } from '../../utils/create-component-model';
import { getContainerForNewElement } from '../../utils/get-container-for-new-element';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog';

export function ComponentItem( { component }: ComponentItemProps ) {
	const itemRef = useRef< HTMLElement >( null );
	const [ isDeleteDialogOpen, setIsDeleteDialogOpen ] = useState( false );
	const { canRename, canDelete } = useComponentsPermissions();

	const shouldShowActions = canRename || canDelete;

	const {
		ref: editableRef,
		isEditing,
		openEditMode,
		error,
		getProps: getEditableProps,
	} = useEditable( {
		value: component.name,
		onSubmit: ( newName: string ) => renameComponent( component.uid, newName ),
		validation: validateComponentTitle,
	} );

	const componentModel = createComponentModel( component );

	const popupState = usePopupState( {
		variant: 'popover',
		disableAutoFocus: true,
	} );

	const handleClick = () => {
		addComponentToPage( componentModel );
	};

	const handleDragEnd = () => {
		loadComponentsAssets( [ componentModel as V1ElementData ] );

		endDragElementFromPanel();
	};

	const handleDeleteClick = () => {
		setIsDeleteDialogOpen( true );
		popupState.close();
	};

	const handleDeleteConfirm = () => {
		if ( ! component.id ) {
			throw new Error( 'Component ID is required' );
		}

		setIsDeleteDialogOpen( false );
		archiveComponent( component.id, component.name );
	};

	const handleDeleteDialogClose = () => {
		setIsDeleteDialogOpen( false );
	};

	return (
		<Stack>
			<WarningInfotip
				open={ Boolean( error ) }
				text={ error ?? '' }
				placement="bottom"
				width={ itemRef.current?.getBoundingClientRect().width }
				offset={ [ 0, -15 ] }
			>
				<CoreComponentItem
					ref={ itemRef }
					component={ component }
					disabled={ false }
					draggable
					onDragStart={ ( event: React.DragEvent ) => startDragElementFromPanel( componentModel, event ) }
					onDragEnd={ handleDragEnd }
					onClick={ handleClick }
					isEditing={ isEditing }
					error={ error }
					nameSlot={
						<ComponentName
							name={ component.name }
							editable={ { ref: editableRef, isEditing, getProps: getEditableProps } }
						/>
					}
					endSlot={
						shouldShowActions ? (
							<IconButton size="tiny" { ...bindTrigger( popupState ) } aria-label="More actions">
								<DotsVerticalIcon fontSize="tiny" />
							</IconButton>
						) : undefined
					}
				/>
			</WarningInfotip>
			{ shouldShowActions && (
				<Menu
					{ ...bindMenu( popupState ) }
					anchorOrigin={ {
						vertical: 'bottom',
						horizontal: 'right',
					} }
					transformOrigin={ {
						vertical: 'top',
						horizontal: 'right',
					} }
				>
					{ canRename && (
						<MenuListItem
							sx={ { minWidth: '160px' } }
							primaryTypographyProps={ { variant: 'caption', color: 'text.primary' } }
							onClick={ () => {
								popupState.close();
								openEditMode();
							} }
						>
							{ __( 'Rename', 'elementor' ) }
						</MenuListItem>
					) }
					{ canDelete && (
						<MenuListItem
							sx={ { minWidth: '160px' } }
							primaryTypographyProps={ { variant: 'caption', color: 'error.light' } }
							onClick={ handleDeleteClick }
						>
							{ __( 'Delete', 'elementor' ) }
						</MenuListItem>
					) }
				</Menu>
			) }
			<DeleteConfirmationDialog
				open={ isDeleteDialogOpen }
				onClose={ handleDeleteDialogClose }
				onConfirm={ handleDeleteConfirm }
			/>
		</Stack>
	);
}

const addComponentToPage = ( model: DropElementParams[ 'model' ] ) => {
	const { container, options } = getContainerForNewElement();

	if ( ! container ) {
		throw new Error( `Can't find container to drop new component instance at` );
	}

	loadComponentsAssets( [ model as V1ElementData ] );

	dropElement( {
		containerId: container.id,
		model,
		options: { ...options, useHistory: false, scrollIntoView: true },
	} );
};

const validateComponentTitle = ( newTitle: string ) => {
	const result = validateComponentName( newTitle );

	if ( ! result.errorMessage ) {
		return null;
	}

	return result.errorMessage;
};
