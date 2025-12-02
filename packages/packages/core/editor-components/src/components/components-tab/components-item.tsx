import * as React from 'react';
import { endDragElementFromPanel, startDragElementFromPanel } from '@elementor/editor-canvas';
import { dropElement, type DropElementParams, type V1ElementData } from '@elementor/editor-elements';
import { ComponentsIcon, DotsVerticalIcon } from '@elementor/icons';
import { bindMenu, bindTrigger, Box, IconButton, ListItemButton, ListItemIcon, ListItemText, Menu, Typography, usePopupState } from '@elementor/ui';

import { loadComponentsAssets } from '../../store/load-components-assets';
import { type Component } from '../../types';
import { getContainerForNewElement } from '../../utils/get-container-for-new-element';
import { createComponentModel } from '../create-component-form/utils/replace-element-with-component';
import { MenuListItem } from '@elementor/editor-ui';
import { __ } from '@wordpress/i18n';
import { useArchive } from '../../hooks/use-archive';
import { setDocumentModifiedStatus } from '@elementor/editor-documents';

type ComponentItemProps = {
	component: Omit< Component, 'id' > & { id?: number };
};

export const ComponentItem = ( { component }: ComponentItemProps ) => {
	const componentModel = createComponentModel(component);
	
	const handleArchive = useArchive();
	const popupState = usePopupState({
		variant: 'popover',
		disableAutoFocus: true,
	});
	
	const handleClick = () => {
		addComponentToPage( componentModel );
	};

	const handleDragEnd = () => {
		loadComponentsAssets( [ componentModel as V1ElementData ] );

		endDragElementFromPanel();
	};

	const handleArchiveClick =  () => {
		popupState.close();
		handleArchive(component.id as number);
		setDocumentModifiedStatus(true);
	};

	return (
		<>
		<ListItemButton
			draggable
			onDragStart={ () => startDragElementFromPanel( componentModel ) }
			onDragEnd={ handleDragEnd }
			shape="rounded"
			sx={ { border: 'solid 1px', borderColor: 'divider', py: 0.5, px: 1 } }
		>
			<Box sx={ { display: 'flex', width: '100%', alignItems: 'center', gap: 1 } } onClick={ handleClick }>
				<ListItemIcon size="tiny">
					<ComponentsIcon fontSize="tiny" />
				</ListItemIcon>
				<ListItemText
					primary={
						<Typography variant="caption" sx={ { color: 'text.primary' } }>
							{ component.name }
						</Typography>
					}
				/>
				
			</Box>
			<IconButton size="tiny" { ...bindTrigger( popupState ) } aria-label="More actions">
								<DotsVerticalIcon fontSize="tiny" />
							</IconButton>
			</ListItemButton>
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
					onClick={ handleArchiveClick}
				>
					<Typography variant="caption" sx={ { color: 'text.primary' } }>
						{ __( 'Archive', 'elementor' ) }
					</Typography>
				</MenuListItem>
			</Menu>
		</>
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
