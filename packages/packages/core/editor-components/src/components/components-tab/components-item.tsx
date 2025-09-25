import * as React from 'react';
import { endDragElementFromPanel, startDragElementFromPanel } from '@elementor/editor-canvas';
import { dropElement, type DropElementParams } from '@elementor/editor-elements';
import { MenuListItem } from '@elementor/editor-ui';
import { DotsVerticalIcon, EyeIcon } from '@elementor/icons';
import {
	bindMenu,
	bindTrigger,
	Box,
	IconButton,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Menu,
	Typography,
	usePopupState,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type Component } from '../../types';
import { getContainerForNewElement } from '../../utils/get-container-for-new-element';
import { createComponentModel } from '../create-component-form/utils/replace-element-with-component';

export const ComponentItem = ( { component }: { component: Component } ) => {
	const componentModel = createComponentModel( { id: component.id, name: component.name } );

	const popupState = usePopupState( {
		variant: 'popover',
		disableAutoFocus: true,
	} );

	const handleClick = () => {
		addComponentToPage( componentModel );
	};

	return (
		<ListItemButton
			draggable
			onDragStart={ () => startDragElementFromPanel( componentModel ) }
			onDragEnd={ endDragElementFromPanel }
			shape="rounded"
			sx={ { border: 'solid 1px', borderColor: 'divider', py: 0.5, px: 1 } }
		>
			<Box sx={ { display: 'flex', width: '100%', alignItems: 'center', gap: 1 } } onClick={ handleClick }>
				<ListItemIcon size="tiny">
					<EyeIcon fontSize="tiny" />
				</ListItemIcon>
				<ListItemText
					primary={
						<Typography variant="caption" sx={ { color: 'text.primary' } }>
							{ component.name }
						</Typography>
					}
				/>
			</Box>
			<IconButton size="tiny" aria-label="More actions" { ...bindTrigger( popupState ) }>
				<DotsVerticalIcon fontSize="tiny" />
			</IconButton>
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
				<MenuListItem sx={ { minWidth: '160px' } }>
					<Typography variant="caption" sx={ { color: 'text.primary' } }>
						{ __( 'Rename', 'elementor' ) }
					</Typography>
				</MenuListItem>
				<MenuListItem
					onClick={ () => {
						popupState.close();
					} }
				>
					<Typography variant="caption" sx={ { color: 'error.light' } }>
						{ __( 'Delete', 'elementor' ) }
					</Typography>
				</MenuListItem>
			</Menu>
		</ListItemButton>
	);
};

const addComponentToPage = ( model: DropElementParams[ 'model' ] ) => {
	const { container, options } = getContainerForNewElement();

	if ( ! container ) {
		throw new Error( `Can't find container to drop new component instance at` );
	}

	dropElement( {
		containerId: container.id,
		model,
		options: { ...options, useHistory: false, scrollIntoView: true },
	} );
};
