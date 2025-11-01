import * as React from 'react';
import { endDragElementFromPanel, startDragElementFromPanel } from '@elementor/editor-canvas';
import { dropElement, type DropElementParams } from '@elementor/editor-elements';
import { ComponentsIcon } from '@elementor/icons';
import { Box, ListItemButton, ListItemIcon, ListItemText, Typography } from '@elementor/ui';

import { loadComponentsStyles } from '../../store/load-components-styles';
import { type Component, type Element } from '../../types';
import { getContainerForNewElement } from '../../utils/get-container-for-new-element';
import { createComponentModel } from '../create-component-form/utils/replace-element-with-component';

export const ComponentItem = ( { component }: { component: Component } ) => {
	const componentModel = createComponentModel( { id: component.id, name: component.name } );

	const handleClick = () => {
		addComponentToPage( componentModel );
	};

	const handleDragEnd = () => {
		loadComponentsStyles( [ componentModel as Element ] );

		endDragElementFromPanel();
	};

	return (
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
		</ListItemButton>
	);
};

const addComponentToPage = ( model: DropElementParams[ 'model' ] ) => {
	const { container, options } = getContainerForNewElement();

	if ( ! container ) {
		throw new Error( `Can't find container to drop new component instance at` );
	}

	loadComponentsStyles( [ model as Element ] );

	dropElement( {
		containerId: container.id,
		model,
		options: { ...options, useHistory: false, scrollIntoView: true },
	} );
};
