import * as EditorAppBar from '@elementor/editor-app-bar';
import { __ } from '@wordpress/i18n';
import * as React from 'react';
import TopBarIcon from './topbar-icon';
import { toggleChecklistPopup } from './utils/functions';

export const editorV2 = () => {
	const { utilitiesMenu } = EditorAppBar;

	utilitiesMenu.registerLink( {
		id: 'app-bar-menu-item-checklist',
		priority: 5,
		useProps: () => {
			return {
				title: __( 'Checklist', 'elementor' ),
				icon: () => <TopBarIcon />,
				onClick: toggleChecklistPopup,
			};
		},
	} );
};
