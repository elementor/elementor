import { __ } from '@wordpress/i18n';
import { openRoute } from '@elementor/v1-adapters';
import ToggleRightIcon from '../icons/toggle-right-icon';

// TODO: Use return type from the TopBar package once merged.
export default function useActionProps() {
	return {
		icon: ToggleRightIcon,
		title: __( 'User Preferences', 'elementor' ),
		onClick: () => openRoute( 'panel/editor-preferences' ),
	};
}
