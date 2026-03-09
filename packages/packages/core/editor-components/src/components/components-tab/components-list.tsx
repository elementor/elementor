import * as React from 'react';
import { useLayoutEffect, useRef, useState } from 'react';
import { isAngieAvailable, isAngieSidebarOpen, sendPromptToAngie } from '@elementor/editor-mcp';
import { AIIcon, ComponentsIcon } from '@elementor/icons';
import { Box, Divider, Link, List, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useComponents } from '../../hooks/use-components';
import { useComponentsPermissions } from '../../hooks/use-components-permissions';
import { AngieInstallDialog } from '../angie-install-dialog';
import { AngieIntroPopover, useAngieIntro } from '../angie-intro';
import { ComponentItem } from './components-item';
import { LoadingComponents } from './loading-components';
import { useSearch } from './search-provider';

const LEARN_MORE_URL = 'http://go.elementor.com/components-guide-article';

// Injected dynamically because global CSS would break the Widgets tab (shared panel elements).
const EMPTY_STATE_STYLE_ID = 'components-empty-state-full-height';

const FULL_HEIGHT_CSS = `
#elementor-panel-page-elements {
	display: flex;
	flex-direction: column;
	height: 100%;
}

#elementor-panel-elements {
	display: flex;
	flex-direction: column;
	flex: 1;
	min-height: 0;
}

#elementor-panel-elements-wrapper {
	display: flex;
	flex-direction: column;
	flex: 1;
	min-height: 0;
}
`;

const useFullHeightPanel = () => {
	useLayoutEffect( () => {
		let style = document.getElementById( EMPTY_STATE_STYLE_ID );

		if ( ! style ) {
			style = document.createElement( 'style' );
			style.id = EMPTY_STATE_STYLE_ID;
			style.textContent = FULL_HEIGHT_CSS;
			document.head.appendChild( style );
		}

		return () => {
			document.getElementById( EMPTY_STATE_STYLE_ID )?.remove();
		};
	}, [] );
};

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

const GENERATE_COMPONENT_PROMPT = 'Tell Angie what component you want to build';

export const EmptyState = () => {
	const { canCreate } = useComponentsPermissions();
	const { shouldShowIntro, suppressIntro } = useAngieIntro();
	const [ isIntroOpen, setIsIntroOpen ] = useState( false );
	const [ isInstallDialogOpen, setIsInstallDialogOpen ] = useState( false );
	const linkRef = useRef< HTMLButtonElement | null >( null );

	useFullHeightPanel();

	const handleGenerateClick = () => {
		if ( ! isAngieAvailable() ) {
			setIsInstallDialogOpen( true );
			return;
		}

		if ( isAngieSidebarOpen() ) {
			sendPromptToAngie( GENERATE_COMPONENT_PROMPT );
			return;
		}

		if ( shouldShowIntro ) {
			setIsIntroOpen( true );
			return;
		}

		sendPromptToAngie( GENERATE_COMPONENT_PROMPT );
	};

	const handleIntroConfirm = () => {
		suppressIntro();
		setIsIntroOpen( false );
		sendPromptToAngie( GENERATE_COMPONENT_PROMPT );
	};

	const handleIntroClose = () => {
		setIsIntroOpen( false );
	};

	const handleInstallDialogClose = () => {
		setIsInstallDialogOpen( false );
	};

	const isMac = navigator.platform.toUpperCase().indexOf( 'MAC' ) >= 0;
	const shortcutKey = isMac ? 'Cmd' : 'Ctrl';

	return (
		<Stack
			alignItems="center"
			justifyContent="start"
			height="100%"
			sx={ { px: 2, py: 4 } }
			gap={ 1 }
			overflow="hidden"
		>
			<Stack alignItems="center" gap={ 1.75 }>
				<ComponentsIcon fontSize="large" sx={ { color: 'text.secondary' } } />

				<Stack alignItems="center" gap={ 1.75 }>
					<Typography align="center" variant="subtitle2" color="text.secondary" sx={ SUBTITLE_OVERRIDE_SX }>
						{ __( 'Create your first component', 'elementor' ) }
					</Typography>

					<Typography align="center" variant="caption" color="text.tertiary">
						{ canCreate
							? `${ __( 'To create, press', 'elementor' ) } ${ shortcutKey }+ Shift + K ${ __(
									'on div-block or flexbox.',
									'elementor'
							  ) }`
							: __(
									'With your current role, you cannot create components. Contact an administrator to create one.',
									'elementor'
							  ) }
					</Typography>
				</Stack>
			</Stack>

			{ canCreate && (
				<>
					<Typography variant="subtitle2" color="text.primary" sx={ { py: 0.5, fontWeight: 500 } }>
						{ __( 'Or', 'elementor' ) }
					</Typography>

					<Stack alignItems="center" gap={ 1 }>
						<Typography align="center" variant="caption" color="text.tertiary">
							{ __( 'Create a custom component with Angie', 'elementor' ) }
						</Typography>

						<Link
							ref={ linkRef }
							component="button"
							variant="caption"
							onClick={ handleGenerateClick }
							sx={ {
								display: 'flex',
								alignItems: 'center',
								padding: 0.5,
								gap: 0.5,
								color: '#c00bb9',
								textDecoration: 'none',
								'&:hover': { textDecoration: 'underline' },
							} }
						>
							<AIIcon sx={ { fontSize: 16 } } />
							{ __( 'Create component', 'elementor' ) }
						</Link>

						<AngieIntroPopover
							open={ isIntroOpen }
							onClose={ handleIntroClose }
							onConfirm={ handleIntroConfirm }
							anchorRef={ linkRef }
						/>
					</Stack>
				</>
			) }

			<Stack alignItems="center" gap={ 0.5 } sx={ { mt: 'auto', width: '100%' } }>
				<Divider sx={ { width: '100%', mb: 2 } } />
				<Typography align="center" variant="caption" color="text.tertiary">
					{ __( 'Components are reusable elements that sync across your site.', 'elementor' ) }
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

			<AngieInstallDialog
				open={ isInstallDialogOpen }
				onClose={ handleInstallDialogClose }
				prompt={ GENERATE_COMPONENT_PROMPT }
			/>
		</Stack>
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
