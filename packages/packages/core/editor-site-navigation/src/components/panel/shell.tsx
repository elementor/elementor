import * as React from 'react';
import { useState } from 'react';
import { Panel, PanelBody, PanelHeader, PanelHeaderTitle } from '@elementor/editor-panels';
import { __ } from '@wordpress/i18n';

import { panelPostTypeSlugs } from '../../api/post';
import { PostListContextProvider } from '../../contexts/post-list-context';
import ErrorSnackbar from './error-snackbar';
import PostsCollapsibleList from './posts-list/posts-collapsible-list';

const Shell = () => {
	const [ isErrorSnackbarOpen, setIsErrorSnackbarOpen ] = useState( false );

	return (
		<Panel>
			<PanelHeader>
				<PanelHeaderTitle>{ __( 'Content', 'elementor' ) }</PanelHeaderTitle>
			</PanelHeader>
			<PanelBody>
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
	);
};

export default Shell;
