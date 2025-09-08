import * as React from 'react';
import { ThemeProvider } from '@elementor/editor-ui';
import { BanIcon } from '@elementor/icons';
import { Divider, Icon, List, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useComponents } from '../../hooks/use-components';
import { ComponentItem } from './components-item';
import { LoadingComponents } from './loading-components';

export function ComponentsList() {
	const { data: components, isLoading } = useComponents();

	if ( ! components && ! isLoading ) {
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
