import * as React from 'react';
import { useRef } from 'react';
import { endDragElementFromPanel, startDragElementFromPanel } from '@elementor/editor-canvas';
import { dropElement, type DropElementParams, type V1ElementData } from '@elementor/editor-elements';
import { EditableField, EllipsisWithTooltip, MenuListItem, useEditable, WarningInfotip } from '@elementor/editor-ui';
import { ComponentsIcon, DotsVerticalIcon } from '@elementor/icons';
import {
	bindMenu,
	bindTrigger,
	Box,
	IconButton,
	ListItemButton,
	ListItemIcon,
	Menu,
	Stack,
	styled,
	type Theme,
	Typography,
	usePopupState,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { archiveComponent } from '../../store/actions/archive-component';
import { loadComponentsAssets } from '../../store/actions/load-components-assets';
import { type Component } from '../../types';
import { validateComponentName } from '../../utils/component-name-validation';
import { getContainerForNewElement } from '../../utils/get-container-for-new-element';
import { createComponentModel } from '../create-component-form/utils/replace-element-with-component';

type ComponentItemProps = {
	component: Omit< Component, 'id' > & { id?: number };
	renameComponent: ( newName: string ) => void;
};

export const ComponentItem = ( { component, renameComponent }: ComponentItemProps ) => {
	const itemRef = useRef< HTMLElement >( null );

	const {
		ref: editableRef,
		isEditing,
		openEditMode,
		error,
		getProps: getEditableProps,
	} = useEditable( {
		value: component.name,
		onSubmit: renameComponent,
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

	const handleArchiveClick = () => {
		popupState.close();

		if ( ! component.id ) {
			throw new Error( 'Component ID is required' );
		}

		archiveComponent( component.id, component.name );
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
				<ListItemButton
					draggable
					onDragStart={ ( event: React.DragEvent ) => startDragElementFromPanel( componentModel, event ) }
					onDragEnd={ handleDragEnd }
					shape="rounded"
					ref={ itemRef }
					sx={ {
						border: 'solid 1px',
						borderColor: 'divider',
						py: 0.5,
						px: 1,
						display: 'flex',
						width: '100%',
						alignItems: 'center',
						gap: 1,
					} }
				>
					<Box
						display="flex"
						alignItems="center"
						gap={ 1 }
						minWidth={ 0 }
						flexGrow={ 1 }
						onClick={ handleClick }
					>
						<ListItemIcon size="tiny">
							<ComponentsIcon fontSize="tiny" />
						</ListItemIcon>
						<Indicator isActive={ isEditing } isError={ !! error }>
							<Box display="flex" flex={ 1 } minWidth={ 0 } flexGrow={ 1 }>
								{ isEditing ? (
									<EditableField
										ref={ editableRef }
										as={ Typography }
										variant="caption"
										{ ...getEditableProps() }
									/>
								) : (
									<EllipsisWithTooltip
										title={ component.name }
										as={ Typography }
										variant="caption"
										color="text.primary"
									/>
								) }
							</Box>
						</Indicator>
					</Box>
					<IconButton size="tiny" { ...bindTrigger( popupState ) } aria-label="More actions">
						<DotsVerticalIcon fontSize="tiny" />
					</IconButton>
				</ListItemButton>
			</WarningInfotip>
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
				<MenuListItem
					sx={ { minWidth: '160px' } }
					onClick={ () => {
						popupState.close();
						openEditMode();
					} }
				>
					{ __( 'Rename', 'elementor' ) }
				</MenuListItem>
				<MenuListItem sx={ { minWidth: '160px' } } onClick={ handleArchiveClick }>
					<Typography variant="caption" sx={ { color: 'error.light' } }>
						{ __( 'Delete', 'elementor' ) }
					</Typography>
				</MenuListItem>
			</Menu>
		</Stack>
	);
};

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

const Indicator = styled( Box, {
	shouldForwardProp: ( prop ) => prop !== 'isActive' && prop !== 'isError',
} )( ( { theme, isActive, isError } ) => ( {
	display: 'flex',
	width: '100%',
	flexGrow: 1,
	borderRadius: theme.spacing( 0.5 ),
	border: getIndicatorBorder( { isActive, isError, theme } ),
	padding: `0 ${ theme.spacing( 1 ) }`,
	marginLeft: isActive ? theme.spacing( 1 ) : 0,
	minWidth: 0,
} ) );

const getIndicatorBorder = ( { isActive, isError, theme }: { isActive: boolean; isError: boolean; theme: Theme } ) => {
	if ( isError ) {
		return `2px solid ${ theme.palette.error.main }`;
	}

	if ( isActive ) {
		return `2px solid ${ theme.palette.secondary.main }`;
	}

	return 'none';
};
