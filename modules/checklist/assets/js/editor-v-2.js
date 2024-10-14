import * as EditorAppBar from '@elementor/editor-app-bar';
import { __ } from '@wordpress/i18n';
import * as React from 'react';
import TopBarIcon from './topbar-icon';
import { toggleChecklistPopup, addMixpanelTrackingChecklistTopBar } from './utils/functions';
import { QueryClient, QueryClientProvider } from '@elementor/query';
import { TogglePopup } from './commands';

const queryClient = new QueryClient();

export const editorV2 = () => {
	const { utilitiesMenu } = EditorAppBar;

	utilitiesMenu.registerLink( {
		id: 'app-bar-menu-item-checklist',
		priority: 5,
		useProps: () => {
			return {
				title: __( 'Checklist', 'elementor' ),
				icon: () => <QueryClientProvider client={ queryClient }>
					<TopBarIcon />
				</QueryClientProvider>,
				onClick: () => {
					addMixpanelTrackingChecklistTopBar( TogglePopup.isOpen );
					toggleChecklistPopup();
				},
			};
		},
	} );
};
