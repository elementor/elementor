import * as React from 'react';
import { useState } from 'react';
import { Panel, PanelBody, PanelHeader, PanelHeaderTitle } from '@elementor/editor-panels';
import { __ } from '@wordpress/i18n';

import { PostListContextProvider } from '../../contexts/post-list-context';
import ErrorSnackbar from './error-snackbar';
import PostsCollapsibleList from './posts-list/posts-collapsible-list';

const Shell = () => {
	const [ isErrorSnackbarOpen, setIsErrorSnackbarOpen ] = useState( false );

	return (
		<Panel>
			<PanelHeader>
				<PanelHeaderTitle>{ __( 'Pages', 'elementor' ) }</PanelHeaderTitle>
			</PanelHeader>
			<PanelBody>
				<PostListContextProvider type={ 'page' } setError={ () => setIsErrorSnackbarOpen( true ) }>
					<PostsCollapsibleList isOpenByDefault={ true } />
				</PostListContextProvider>
				<ErrorSnackbar open={ isErrorSnackbarOpen } onClose={ () => setIsErrorSnackbarOpen( false ) } />
			</PanelBody>
		</Panel>
	);
};

export default Shell;
