import * as React from 'react';
import { ComponentsIcon, EyeIcon } from '@elementor/icons';
import { Box, Divider, Icon, Link, List, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useComponents } from '../../hooks/use-components';
import { ComponentItem } from './components-item';
import { LoadingComponents } from './loading-components';
import { useSearch } from './search-provider';

export function ComponentsList() {
	const { components, isLoading, searchValue } = useFilteredComponents();

	const renameComponent = ( newName: string ) => {
		console.log( newName );
	};

	if ( isLoading ) {
		return <LoadingComponents />;
	}
	const isEmpty = ! components || components.length === 0;
	if ( isEmpty ) {
		if ( searchValue.length > 0 ) {
			return <EmptySearchResult />;
		}
		return <EmptyState />;
	}

	return (
		<List sx={ { display: 'flex', flexDirection: 'column', gap: 1, px: 2 } }>
			{ components.map( ( component ) => (
				<ComponentItem key={ component.uid } component={ component } renameComponent={ renameComponent } />
			) ) }
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

const EmptySearchResult = () => {
	const { searchValue, clearSearch } = useSearch();
	return (
		<Stack
			color={ 'text.secondary' }
			pt={ 5 }
			alignItems="center"
			gap={ 1 }
			overflow={ 'hidden' }
			justifySelf={ 'center' }
		>
			<ComponentsIcon />
			<Box
				sx={ {
					width: '100%',
				} }
			>
				<Typography align="center" variant="subtitle2" color="inherit">
					{ __( 'Sorry, nothing matched', 'elementor' ) }
				</Typography>
				{ searchValue && (
					<Typography
						variant="subtitle2"
						color="inherit"
						sx={ {
							display: 'flex',
							width: '100%',
							justifyContent: 'center',
						} }
					>
						<span>&ldquo;</span>
						<span
							style={ {
								maxWidth: '80%',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
							} }
						>
							{ searchValue }
						</span>
						<span>&rdquo;.</span>
					</Typography>
				) }
			</Box>
			<Typography align="center" variant="caption" color="inherit">
				{ __( 'Try something else.', 'elementor' ) }
			</Typography>
			<Typography align="center" variant="caption" color="inherit">
				<Link color="secondary" variant="caption" component="button" onClick={ clearSearch }>
					{ __( 'Clear & try again', 'elementor' ) }
				</Link>
			</Typography>
		</Stack>
	);
};

const useFilteredComponents = () => {
	const { components, isLoading } = useComponents();
	const { searchValue } = useSearch();

	return {
		components: components.filter( ( component ) =>
			component.name.toLowerCase().includes( searchValue.toLowerCase() )
		),
		isLoading,
		searchValue,
	};
};
