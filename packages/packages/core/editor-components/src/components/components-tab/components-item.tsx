import * as React from 'react';
import { dropElement, type DropElementParams } from '@elementor/editor-elements';
import { ComponentsIcon, DotsVerticalIcon } from '@elementor/icons';
import {
	bindTrigger,
	Box,
	IconButton,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Typography,
	usePopupState,
} from '@elementor/ui';

import { type Component } from '../../types';
import { getContainerForNewElement } from '../../utils/get-container-for-new-element';
import { createComponentModel } from '../create-component-form/utils/replace-element-with-component';
import { ComponentsMenu } from './components-menu';

export const ComponentItem = ( { component }: { component: Component } ) => {
	const popupState = usePopupState( {
		variant: 'popover',
		disableAutoFocus: true,
	} );

	const handleClick = () => {
		addComponentToPage(component);
	};

	return (
		<ListItemButton shape="rounded" sx={{ border: "solid 1px", borderColor: "divider", py: 0.5, px: 1 }}>
			<Box sx={{ display: "flex", width: "100%", alignItems: "center", gap: 1 }} onClick={handleClick}>
				<ListItemIcon size="tiny">
					<ComponentsIcon fontSize="tiny" />
				</ListItemIcon>
				<ListItemText
					primary={
						<Typography variant="caption" sx={{ color: "text.primary" }}>
							{component.name}
						</Typography>
					}
				/>
			</Box>
			<IconButton size="tiny" aria-label="More actions" {...bindTrigger(popupState)}>
				<DotsVerticalIcon fontSize="tiny" />
			</IconButton>
			<ComponentsMenu popupState={popupState} />
		</ListItemButton>
	);
};

const addComponentToPage = ( component: Component ) => {
	const { container, options } = getContainerForNewElement();
	const model = createComponentModel( component );

	if ( ! container ) {
		throw new Error( `Can't find container to drop new component instance at` );
	}

	dropElement( {
		containerId: container.id,
		model,
		options: { ...options, useHistory: false, scrollIntoView: true },
	} );
};
