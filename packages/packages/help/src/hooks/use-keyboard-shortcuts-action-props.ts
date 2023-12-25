import { __ } from '@wordpress/i18n';
import { ActionProps } from '@elementor/top-bar';
import { KeyboardIcon } from '@elementor/icons';
import { runCommand } from '@elementor/v1-adapters';

export default function useKeyboardShortcutsActionProps(): ActionProps {
	return {
		icon: KeyboardIcon,
		title: __( 'Keyboard Shortcuts', 'elementor' ),
		onClick: () => runCommand( 'shortcuts/open' ),
	};
}
