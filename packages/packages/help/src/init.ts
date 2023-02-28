import { __ } from '@wordpress/i18n';
import { HelpIcon } from '@elementor/icons';
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
		priority: 40, // After user preferences.
		useProps: useKeyboardShortcutsActionProps,
	} );

	registerLink( 'utilities', {
		name: 'open-help-center',
		priority: 20, // After Finder.
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
