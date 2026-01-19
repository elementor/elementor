import * as React from 'react';
import { ComponentsIcon } from '@elementor/icons';
import { Box, Divider, Link, List, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useComponents } from '../../hooks/use-components';
import { useComponentsPermissions } from '../../hooks/use-components-permissions';
import { renameComponent } from '../../store/actions/rename-component';
import { ComponentItem } from './components-item';
import { LoadingComponents } from './loading-components';
import { useSearch } from './search-provider';

const LEARN_MORE_URL = 'http://go.elementor.com/components-guide-article';

// Override legacy panel CSS reset that sets h1-h6 to font-size:100% and font-weight:normal.
// See: assets/dev/scss/editor/panel/_reset.scss (applied via :where() selector in panel.scss).
const SUBTITLE_OVERRIDE_SX = {
	fontSize: '0.875rem !important',
	fontWeight: '500 !important',
};

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
				<ComponentItem
					key={ component.uid }
					component={ component }
					renameComponent={ ( newName ) => {
						renameComponent( component.uid, newName );
					} }
				/>
			) ) }
		</List>
	);
}

const EmptyState = () => {
	const { canCreate } = useComponentsPermissions();

	return (
		<Stack
			alignItems="center"
			justifyContent="start"
			height="100%"
			sx={ { px: 2, py: 4 } }
			gap={ 2 }
			overflow="hidden"
		>
			<Stack alignItems="center" gap={ 1 }>
				<ComponentsIcon fontSize="large" sx={ { color: 'text.secondary' } } />

				<Typography align="center" variant="subtitle2" color="text.secondary" sx={ SUBTITLE_OVERRIDE_SX }>
					{ __( 'No components yet', 'elementor' ) }
				</Typography>

				<Typography align="center" variant="caption" color="secondary" sx={ { maxWidth: 200 } }>
					{ __( 'Components are reusable blocks that sync across your site.', 'elementor' ) }
					<br />
					{ canCreate
						? __( 'Create once, use everywhere.', 'elementor' )
						: __(
								'With your current role, you cannot create components. Contact an administrator to create one.',
								'elementor'
						  ) }
				</Typography>
				<Link
					href={ LEARN_MORE_URL }
					target="_blank"
					rel="noopener noreferrer"
					variant="caption"
					color="info.main"
				>
					{ __( 'Learn more about components', 'elementor' ) }
				</Link>
			</Stack>

			{ canCreate && (
				<>
					<Divider sx={ { width: '100%' } } />
					<Stack alignItems="center" gap={ 1 } width="100%">
						<Typography
							align="center"
							variant="subtitle2"
							color="text.secondary"
							sx={ SUBTITLE_OVERRIDE_SX }
						>
							{ __( 'Create your first one:', 'elementor' ) }
						</Typography>

						<Typography align="center" variant="caption" color="secondary" sx={ { maxWidth: 228 } }>
							{ __(
								'Right-click any div-block or flexbox on your canvas or structure and select "Create component"',
								'elementor'
							) }
						</Typography>
					</Stack>
				</>
			) }
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
				<Typography align="center" variant="subtitle2" color="inherit" sx={ SUBTITLE_OVERRIDE_SX }>
					{ __( 'Sorry, nothing matched', 'elementor' ) }
				</Typography>
				{ searchValue && (
					<Typography
						variant="subtitle2"
						color="inherit"
						sx={ {
							...SUBTITLE_OVERRIDE_SX,
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
