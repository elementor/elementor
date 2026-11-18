import * as React from 'react';
import { useState } from 'react';
import { Panel, PanelBody, PanelHeader, PanelHeaderTitle } from '@elementor/editor-panels';
import { Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { panelPostTypeSlugs } from '../../api/post';
import { ContentPanelCoordinatorProvider } from '../../contexts/content-panel-coordinator';
import { PostListContextProvider } from '../../contexts/post-list-context';
import ContentPanelHeaderAdd from './content-panel-header-add';
import ContentPanelSearch from './content-panel-search';
import ErrorSnackbar from './error-snackbar';
import PostsCollapsibleList from './posts-list/posts-collapsible-list';

const Shell = () => {
	const [ isErrorSnackbarOpen, setIsErrorSnackbarOpen ] = useState( false );

	return (
		<ContentPanelCoordinatorProvider>
			<Panel>
				<PanelHeader>
					<Stack
						alignItems="center"
						direction="row"
						spacing={ 0.5 }
						sx={ {
							p: 1,
							paddingInlineStart: 2,
							width: '100%',
						} }
					>
						<PanelHeaderTitle sx={ { flex: 1, minWidth: 0, textAlign: 'start' } }>
							{ __( 'Site content', 'elementor' ) }
						</PanelHeaderTitle>
						<ContentPanelHeaderAdd />
					</Stack>
				</PanelHeader>
				<PanelBody>
					<ContentPanelSearch />
					{ panelPostTypeSlugs.map( ( postTypeSlug, index ) => (
						<PostListContextProvider
							key={ postTypeSlug }
							type={ postTypeSlug }
							setError={ () => setIsErrorSnackbarOpen( true ) }
						>
							<PostsCollapsibleList isOpenByDefault={ index === 0 } />
						</PostListContextProvider>
					) ) }
					<ErrorSnackbar open={ isErrorSnackbarOpen } onClose={ () => setIsErrorSnackbarOpen( false ) } />
				</PanelBody>
			</Panel>
		</ContentPanelCoordinatorProvider>
	);
};

export default Shell;