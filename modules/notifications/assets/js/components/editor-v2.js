import { GiftIcon } from '../icons/gift-icon';
import { editorOnButtonClicked } from './editor-on-button-clicked';
import { __ } from '@wordpress/i18n';

export const editorV2 = () => {
	const { mainMenu } = window.elementorV2.editorAppBar;

	mainMenu.registerLink( {
		id: 'app-bar-menu-item-whats-new',
		priority: 1,
		useProps: () => {
			return {
				title: __( "What's New", 'elementor' ),
				icon: GiftIcon,
				priority: 5,
				onClick: editorOnButtonClicked,
			};
		},
	} );
}

