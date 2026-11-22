import * as React from 'react';
import { useState } from 'react';
import { Panel, PanelBody, PanelHeader, PanelHeaderTitle } from '@elementor/editor-panels';
import { Divider, List, Skeleton, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { ContentPanelCoordinatorProvider } from '../../contexts/content-panel-coordinator';
import { PostListContextProvider } from '../../contexts/post-list-context';
import useAccessiblePanelPostTypes from '../../hooks/use-accessible-panel-post-types';
import { contentPanelHeaderStackSx } from './content-panel-chrome';
import ContentPanelHeaderAdd from './content-panel-header-add';
import ContentPanelSearch from './content-panel-search';
import ErrorSnackbar from './error-snackbar';
import PostsCollapsibleList from './posts-list/posts-collapsible-list';
import UserLoadError from './user-load-error';

const Shell = () => {
	const [ isErrorSnackbarOpen, setIsErrorSnackbarOpen ] = useState( false );
	const { accessiblePostTypes, isUserPending, showUserLoadError } = useAccessiblePanelPostTypes();

	return (
		<ContentPanelCoordinatorProvider>
			<Panel>
				<PanelHeader>
					<Stack
						alignItems="center"
						direction="row"
						spacing={ 0.5 }
						sx={ {
							...contentPanelHeaderStackSx,
						} }
					>
						<PanelHeaderTitle sx={ { flex: 1, minWidth: 0, textAlign: 'start' } }>
							{ __( 'Site content', 'elementor' ) }
						</PanelHeaderTitle>
						<ContentPanelHeaderAdd />
					</Stack>
				</PanelHeader>
				<Divider />
				<PanelBody>
					<ContentPanelSearch />
					{ isUserPending ? (
						<Stack spacing={ 1 } sx={ { px: 2, py: 1 } } data-testid="site-content-user-skeleton">
							<Skeleton animation="wave" height={ 28 } variant="rounded" width="100%" />
							<Skeleton animation="wave" height={ 28 } variant="rounded" width="80%" />
						</Stack>
					) : showUserLoadError ? (
						<UserLoadError />
					) : (
						<List dense disablePadding sx={ { py: 0, width: '100%' } }>
							{ accessiblePostTypes.map( ( postTypeSlug, index ) => (
								<PostListContextProvider
									key={ postTypeSlug }
									type={ postTypeSlug }
									setError={ () => setIsErrorSnackbarOpen( true ) }
								>
									<PostsCollapsibleList isOpenByDefault={ index === 0 } />
								</PostListContextProvider>
							) ) }
						</List>
					) }
					<ErrorSnackbar open={ isErrorSnackbarOpen } onClose={ () => setIsErrorSnackbarOpen( false ) } />
				</PanelBody>
			</Panel>
		</ContentPanelCoordinatorProvider>
	);
};

export default Shell;