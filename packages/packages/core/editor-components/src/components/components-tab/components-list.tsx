import * as React from 'react';
import { getAngieSdk } from '@elementor/editor-mcp';
import { ComponentsIcon, StarIcon } from '@elementor/icons';
import { Box, Button, Divider, Link, List, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useComponents } from '../../hooks/use-components';
import { ComponentItem } from './components-item';
import { LoadingComponents } from './loading-components';
import { useSearch } from './search-provider';

const LEARN_MORE_URL = 'http://go.elementor.com/components-guide-article';
const ANGIE_INSTALL_URL = '/wp-admin/plugin-install.php?tab=plugin-information&plugin=angie';

export function ComponentsList() {
	const { components, isLoading, searchValue } = useFilteredComponents();

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
				<ComponentItem key={ component.uid } component={ component } />
			) ) }
		</List>
	);
}

const EmptyState = () => {
	const handleCreateWithAI = () => {
		const angieSdk = getAngieSdk();

		if ( angieSdk.isAngieReady() ) {
			angieSdk.triggerAngie( {
				context: { source: 'components-panel-empty-state' },
			} );
		} else {
			window.open( ANGIE_INSTALL_URL, '_blank' );
		}
	};

	return (
		<Stack
			alignItems="center"
			justifyContent="start"
			height="100%"
			sx={ { px: 2, py: 2 } }
			gap={ 2 }
			overflow="hidden"
		>
			<Box sx={ { p: 1.25 } }>
				<ComponentsIcon sx={ { fontSize: 35, color: 'text.secondary' } } />
			</Box>

			<Stack alignItems="center" gap={ 2.5 } width="100%">
				<Stack alignItems="center" gap={ 1 } width="100%">
					<Typography align="center" variant="h6" color="text.primary">
						{ __( 'No components yet', 'elementor' ) }
					</Typography>

					<Typography align="center" variant="body2" color="text.secondary">
						{ __( 'Components are reusable blocks that sync across your site.', 'elementor' ) }
						<br />
						{ __( 'Create once, use everywhere.', 'elementor' ) }
					</Typography>

					<Link
						href={ LEARN_MORE_URL }
						target="_blank"
						rel="noopener noreferrer"
						variant="body1"
						underline="hover"
					>
						{ __( 'Learn more about components', 'elementor' ) }
					</Link>
				</Stack>

				<Divider sx={ { width: '100%' } } />

				<Stack alignItems="center" gap={ 1 } width="100%">
					<Typography align="center" variant="subtitle1" color="text.primary">
						{ __( 'Create your first one:', 'elementor' ) }
					</Typography>

					<Typography align="center" variant="body2" color="text.secondary">
						{ __( 'Right-click any element on your canvas and select "', 'elementor' ) }
						<Typography
							component="span"
							variant="body2"
							color="text.secondary"
							sx={ { textDecoration: 'underline' } }
						>
							{ __( 'Create component', 'elementor' ) }
						</Typography>
						{ __( '"', 'elementor' ) }
					</Typography>

					<Typography align="center" variant="caption" color="text.secondary">
						{ __( 'Or', 'elementor' ) }
					</Typography>

					<Button
						variant="outlined"
						color="secondary"
						size="small"
						fullWidth
						onClick={ handleCreateWithAI }
						endIcon={ <StarIcon /> }
					>
						{ __( 'Create with AI (beta)', 'elementor' ) }
					</Button>
				</Stack>
			</Stack>
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
