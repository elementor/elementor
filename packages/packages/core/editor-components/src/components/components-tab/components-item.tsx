import * as React from 'react';
import { endDragElementFromPanel, startDragElementFromPanel } from '@elementor/editor-canvas';
import { dropElement, type DropElementParams, type V1ElementData } from '@elementor/editor-elements';
import { notify } from '@elementor/editor-notifications';
import { EllipsisWithTooltip, MenuListItem } from '@elementor/editor-ui';
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
	Typography,
	usePopupState,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { wouldCreateCircularNesting } from '../../prevent-circular-nesting';
import { archiveComponent } from '../../store/actions/archive-component';
import { loadComponentsAssets } from '../../store/actions/load-components-assets';
import { type Component } from '../../types';
import { getContainerForNewElement } from '../../utils/get-container-for-new-element';
import { createComponentModel } from '../create-component-form/utils/replace-element-with-component';

type ComponentItemProps = {
	component: Omit< Component, 'id' > & { id?: number };
};

export const ComponentItem = ( { component }: ComponentItemProps ) => {
	const componentModel = createComponentModel( component );
	const popupState = usePopupState( {
		variant: 'popover',
		disableAutoFocus: true,
	} );

	const handleClick = () => {
		if ( wouldCreateCircularNesting( component.id ) ) {
			notify( {
				type: 'default',
				message: __( 'Cannot add this component here - it would create a circular reference.', 'elementor' ),
				id: 'circular-component-nesting-blocked',
			} );
			return;
		}

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

		archiveComponent( component.id );
	};

	return (
		<Stack>
			<ListItemButton
				draggable
				onDragStart={ () => startDragElementFromPanel( componentModel ) }
				onDragEnd={ handleDragEnd }
				shape="rounded"
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
					onClick={ handleClick }
					sx={ {
						display: 'flex',
						alignItems: 'center',
						gap: 1,
						minWidth: 0,
						flexGrow: 1,
					} }
				>
					<ListItemIcon size="tiny">
						<ComponentsIcon fontSize="tiny" />
					</ListItemIcon>
					<Box display="flex" flex={ 1 } minWidth={ 0 } flexGrow={ 1 }>
						<EllipsisWithTooltip
							title={ component.name }
							as={ Typography }
							variant="caption"
							color="text.primary"
						/>
					</Box>
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
				<MenuListItem sx={ { minWidth: '160px' } } onClick={ handleArchiveClick }>
					{ __( 'Archive', 'elementor' ) }
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
