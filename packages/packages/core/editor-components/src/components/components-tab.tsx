import * as React from 'react';
import { createElement, type CreateElementParams, getContainerForNewElement } from '@elementor/editor-elements';
import { List, ListItem, ListItemButton, ListItemText, Typography } from '@elementor/ui';

import { useComponents } from '../hooks/use-components';
import { type Component } from '../types';
import { getComponentModel } from './create-component-form/utils/replace-element-with-component';

export function ComponentsTab() {
	const { data: components } = useComponents();

	return (
		<List sx={ { display: 'flex', flexDirection: 'column', gap: 0.5, px: 2 } }>
			{ components?.map( ( component ) => <ComponentItem key={ component.id } component={ component } /> ) }
		</List>
	);
}

const ComponentItem = ( { component }: { component: Component } ) => {
	const handleClick = () => {
		addComponent( getComponentModel( component.id ) );
	};

	return (
		<ListItem disablePadding>
			<ListItemButton
				sx={ { border: '1px solid', borderColor: 'divider', py: 0.5, px: 1 } }
				shape="rounded"
				onClick={ handleClick }
			>
				<ListItemText
					primary={
						<Typography variant="caption" sx={ { color: 'text.primary' } }>
							{ component.name }
						</Typography>
					}
				/>
			</ListItemButton>
		</ListItem>
	);
};

const addComponent = ( model: CreateElementParams[ 'model' ] ) => {
	const { container, options } = getContainerForNewElement();
	if ( ! container ) {
		throw new Error( `Can't find container to drop new component instance at` );
	}
	createElement( {
		containerId: container.id,
		model,
		options,
	} );
};
