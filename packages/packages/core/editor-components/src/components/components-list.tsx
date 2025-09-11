import * as React from 'react';
import { EyeIcon } from '@elementor/icons';
import { Divider, Icon, List, Stack, Typography } from '@elementor/ui';
import { useSearch } from '@elementor/utils';
import { __ } from '@wordpress/i18n';

import { useComponents } from '../hooks/use-components';
import { ComponentItem } from './components-item';
import { LoadingComponents } from './loading-components';

export function ComponentsList() {
	const { components, isLoading } = useFilteredComponents();

	if ( isLoading ) {
		return <LoadingComponents />;
	}

	if ( ! components || components.length === 0 ) {
		return <EmptyState />;
	}

	return (
		<List sx={ { display: 'flex', flexDirection: 'column', gap: 1, px: 2 } }>
			{ components?.map( ( component ) => <ComponentItem key={ component.id } component={ component } /> ) }
		</List>
	);
}

const EmptyState = () => {
	return (
		<Stack
			alignItems="center"
			justifyContent="center"
			height="100%"
			sx={ { px: 2.5, pt: 10 } }
			gap={ 1.75 }
			overflow="hidden"
		>
			<Icon fontSize="large">
				<EyeIcon fontSize="large" />
			</Icon>
			<Typography align="center" variant="subtitle2" color="text.secondary" fontWeight="bold">
				{ __( 'Text that explains that there are no Components yet.', 'elementor' ) }
			</Typography>
			<Typography variant="caption" align="center" color="text.secondary">
				{ __(
					'Once you have Components, this is where you can manage them—rearrange, duplicate, rename and delete irrelevant classes.',
					'elementor'
				) }
			</Typography>
			<Divider sx={ { width: '100%' } } color="text.secondary" />
			<Typography align="left" variant="caption" color="text.secondary">
				{ __( 'To create a component, first design it, then choose one of three options:', 'elementor' ) }
			</Typography>
			<Typography
				align="left"
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

const useFilteredComponents = () => {
	const { data: components, isLoading } = useComponents();
	const { debouncedValue: searchValue } = useSearch();

	return {
		components: components?.filter( ( component ) =>
			component.name.toLowerCase().includes( searchValue.toLowerCase() )
		),
		isLoading,
	};
};
