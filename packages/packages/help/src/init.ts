import { __ } from '@wordpress/i18n';
import HelpIcon from './icons/help-icon';
import { useSettings } from '@elementor/editor';
import { registerAction, registerLink } from '@elementor/top-bar';
import useKeyboardShortcutsActionProps from './hooks/use-keyboard-shortcuts-action-props';

export default function init() {
	registerTopBarMenuItems();
}

function registerTopBarMenuItems() {
	registerAction( 'main', {
		name: 'open-keyboard-shortcuts',
		group: 'default',
		priority: 20, // After theme builder.
		useProps: useKeyboardShortcutsActionProps,
	} );

	registerLink( 'utilities', {
		name: 'open-help-center',
		priority: 20,
		useProps: () => {
			const { urls } = useSettings();

			return {
				title: __( 'Help', 'elementor' ),
				href: urls.help,
				icon: HelpIcon,
				target: '_blank',
			};
		},
	} );
}
