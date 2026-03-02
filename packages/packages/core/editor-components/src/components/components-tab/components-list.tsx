import * as React from 'react';
import { useState } from 'react';
import { ComponentsIcon, ElementorAIIcon } from '@elementor/icons';
import { Box, Divider, Link, List, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useAngieIntegration } from '../../hooks/use-angie-integration';
import { useComponents } from '../../hooks/use-components';
import { useComponentsPermissions } from '../../hooks/use-components-permissions';
import { AngieIntroModal, useAngieIntroModal } from '../angie-intro-modal';
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

	const isEmpty = ! components?.length;

	if ( isEmpty ) {
		return searchValue.length ? <EmptySearchResult /> : <EmptyState />;
	}

	return (
		<List sx={ { display: 'flex', flexDirection: 'column', gap: 1, px: 2 } }>
			{ components.map( ( component ) => (
				<ComponentItem key={ component.uid } component={ component } />
			) ) }
		</List>
	);
}

export const EmptyState = () => {
	const { canCreate } = useComponentsPermissions();
	const { isAngieAvailable, isAngieInstalled, triggerAngiePrompt, redirectToInstall } = useAngieIntegration();
	const { shouldShowIntro, suppressIntro } = useAngieIntroModal();
	const [ isIntroModalOpen, setIsIntroModalOpen ] = useState( false );

	const handleGenerateClick = () => {
		if ( ! isAngieInstalled ) {
			redirectToInstall();
			return;
		}

		if ( isAngieAvailable ) {
			triggerAngiePrompt();
			return;
		}

		if ( shouldShowIntro ) {
			setIsIntroModalOpen( true );
			return;
		}

		triggerAngiePrompt();
	};

	const handleIntroConfirm = () => {
		suppressIntro();
		setIsIntroModalOpen( false );
		triggerAngiePrompt();
	};

	const handleIntroClose = () => {
		setIsIntroModalOpen( false );
	};

	const isMac = navigator.platform.toUpperCase().indexOf( 'MAC' ) >= 0;
	const shortcutKey = isMac ? 'Cmd' : 'Ctrl';

	return (
		<>
			<Stack
				alignItems="center"
				justifyContent="start"
				height="100%"
				sx={ { px: 2, py: 4 } }
				gap={ 1 }
				overflow="hidden"
			>
				<Stack alignItems="center" gap={ 0.5 }>
					<ComponentsIcon fontSize="large" sx={ { color: 'text.secondary' } } />

					<Typography align="center" variant="subtitle2" color="text.secondary" sx={ SUBTITLE_OVERRIDE_SX }>
						{ __( 'Create your first component', 'elementor' ) }
					</Typography>

					<Typography align="center" variant="caption" color="text.tertiary">
						{ canCreate
							? `${ __( 'Press', 'elementor' ) } ${ shortcutKey }+ Shift + K ${ __( 'on div-block or flexbox', 'elementor' ) }`
							: __( 'With your current role, you cannot create components. Contact an administrator to create one.', 'elementor' ) }
					</Typography>
				</Stack>

			{ canCreate && (
				<>
					<Typography variant="subtitle2" color="text.primary" sx={ { py: 0.5, fontWeight: 500 } }>
						{ __( 'Or', 'elementor' ) }
					</Typography>

					<Stack alignItems="center" gap={ 0.5 }>
						<Typography align="center" variant="caption" color="text.tertiary">
							{ __( 'Generate a custom component using Angie', 'elementor' ) }
						</Typography>

						<Link
							component="button"
							variant="caption"
							onClick={ handleGenerateClick }
							sx={ {
								display: 'flex',
								alignItems: 'center',
								gap: 0.5,
								color: 'primary.main',
								textDecoration: 'none',
								'&:hover': { textDecoration: 'underline' },
							} }
						>
							<ElementorAIIcon sx={ { fontSize: 16 } } />
							{ __( 'Generate Component', 'elementor' ) }
						</Link>
					</Stack>
				</>
			) }

			<Stack alignItems="center" gap={ 0.5 } sx={ { mt: 'auto', width: '100%' } }>
				<Divider sx={ { width: '100%', mb: 2 } } />
				<Typography align="center" variant="caption" color="text.tertiary">
					{ __( 'Components are reusable blocks that sync across your site.', 'elementor' ) }
				</Typography>
				<Link
					href={ LEARN_MORE_URL }
					target="_blank"
					rel="noopener noreferrer"
					variant="caption"
					color="info.main"
				>
					{ __( 'Learn more', 'elementor' ) }
				</Link>
			</Stack>
			</Stack>

			{ isIntroModalOpen && (
				<AngieIntroModal
					onClose={ handleIntroClose }
					onConfirm={ handleIntroConfirm }
				/>
			) }
		</>
	);
};

export const EmptySearchResult = () => {
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

export const useFilteredComponents = () => {
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
