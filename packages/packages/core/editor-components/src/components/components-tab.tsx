import * as React from 'react';
import { dropElement, type DropElementParams } from '@elementor/editor-elements';
import { ThemeProvider } from '@elementor/editor-ui';
import { BanIcon, DotsHorizontalIcon } from '@elementor/icons';
import {
	Divider,
	Icon,
	IconButton,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Stack,
	Typography,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useComponents } from '../hooks/use-components';
import { type Component } from '../types';
import { getContainerForNewElement } from '../utils/get-container-for-new-element';
import { createComponentModel } from './create-component-form/utils/replace-element-with-component';
import { LoadingComponents } from './loaading-components';

export function ComponentsTab() {
	const { data: components , isLoading } = useComponents();

	
	console.log('components', {components});
	if (!components  && !isLoading) {
		console.log('components', components);
		return <EmptyState />;
	}
	return (
		<ThemeProvider>
			<List sx={ { display: 'flex', flexDirection: 'column', gap: 0.5, px: 2 } }>
				{ isLoading ? (
					<LoadingComponents />
				) : (
					components?.map( ( component ) => <ComponentItem key={ component.id } component={ component } /> )
				) }
			</List>
		</ThemeProvider>
	);
}

const ComponentItem = ( { component }: { component: Component } ) => {
	const handleClick = () => {
		addComponentToPage( createComponentModel( component.id ) );
	};

	return (
		<ListItemButton
			sx={ { border: 'solid 1px', borderColor: 'divider', py: 0.5, px: 1 } }
			shape="rounded"
			onClick={ handleClick }
		>
			<ListItemIcon size="small">
				<BanIcon />
			</ListItemIcon>
			<ListItemText
				primary={
					<Typography variant="caption" sx={ { color: 'text.primary' } }>
						{ component.name }
					</Typography>
				}
			/>
			<IconButton>
				<DotsHorizontalIcon fontSize="small" />
			</IconButton>
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

const EmptyState = () => {
	return (
		<Stack
			alignItems="center"
			justifyContent="center"
			height="100%"
			sx={ {
				px: 2.5,
				pt: 10,
			} }
			gap={ 1.75 }
			overflow="hidden"
		>
			<Icon fontSize="large">
				<BanIcon fontSize="large" />
			</Icon>
			<Typography align="center" variant="subtitle2" color="text.secondary">
				{ __( 'Text that explains that there are no Components yet.', 'elementor' ) }
			</Typography>
			<Typography variant="caption" align="center" color="text.secondary">
				{ __(
					'Once you have Components, this is where you can manage them—rearrange, duplicate, rename and delete irrelevant classes.',
					'elementor'
				) }
			</Typography>
			<Divider sx={ { width: '100%' } } color="divider" />
			<Typography align="start" variant="caption" color="text.secondary">
				{ __( 'To create a component, first design it, then choose one of three options:', 'elementor' ) }
			</Typography>
			<Typography
				align="start"
				variant="caption"
				color="text.secondary"
				sx={ { display: 'flex', flexDirection: 'column' } }
			>
				<span>{ __( '1. Right-click and select Create Component', 'elementor' ) }</span>
				<span>{ __( '2. Use the component icon in the Structure panel', 'elementor' ) }</span>
				<span>{ __( '3. Use the component icon in the Edit panel header', 'elementor' ) }</span>
			</Typography>
		</Stack>
	);
};
