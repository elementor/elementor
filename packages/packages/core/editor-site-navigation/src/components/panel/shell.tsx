import * as React from 'react';
import { useState } from 'react';
import { Panel, PanelBody, PanelHeader, PanelHeaderTitle } from '@elementor/editor-panels';
import { isSidebarEnabled } from '@elementor/editor-sidebar';
import { Divider, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { ContentPanelCoordinatorProvider } from '../../contexts/content-panel-coordinator';
import { SiteContentPanelSectionsFilterProvider } from '../../contexts/site-content-panel-sections-filter';
import useAccessiblePanelPostTypes from '../../hooks/use-accessible-panel-post-types';
import { contentPanelHeaderStackSx } from './content-panel-chrome';
import ContentPanelHeaderAdd from './content-panel-header-add';
import ContentPanelSectionsFilter from './content-panel-sections-filter';
import ErrorSnackbar from './error-snackbar';
import ShellPanelBodyContent from './shell-panel-body-content';

const Shell = () => {
	const sidebarPanelChrome = isSidebarEnabled();
	const [ isErrorSnackbarOpen, setIsErrorSnackbarOpen ] = useState( false );
	const { accessiblePostTypes, isUserPending, showUserLoadError } = useAccessiblePanelPostTypes();

	return (
		<ContentPanelCoordinatorProvider>
			<SiteContentPanelSectionsFilterProvider>
				<Panel>
					<PanelHeader>
						<Stack
							alignItems="center"
							direction="row"
							spacing={ 0.5 }
							sx={ {
								...contentPanelHeaderStackSx,
								...( sidebarPanelChrome ? {} : { p: 1, pl: 2 } ),
							} }
						>
							<PanelHeaderTitle sx={ { flex: 1, minWidth: 0, textAlign: 'start' } }>
								{ __( 'Site content', 'elementor' ) }
							</PanelHeaderTitle>
							<ContentPanelSectionsFilter />
							<ContentPanelHeaderAdd />
						</Stack>
					</PanelHeader>
					<Divider />
					<PanelBody>
						<ShellPanelBodyContent
							accessiblePostTypes={ accessiblePostTypes }
							isUserPending={ isUserPending }
							onListError={ () => setIsErrorSnackbarOpen( true ) }
							showUserLoadError={ showUserLoadError }
						/>
						<ErrorSnackbar open={ isErrorSnackbarOpen } onClose={ () => setIsErrorSnackbarOpen( false ) } />
					</PanelBody>
				</Panel>
			</SiteContentPanelSectionsFilterProvider>
		</ContentPanelCoordinatorProvider>
	);
};

export default Shell;
