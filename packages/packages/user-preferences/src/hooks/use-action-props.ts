import { __ } from '@wordpress/i18n';
import ToggleRightIcon from '../icons/toggle-right-icon';
import { openRoute, useRouteStatus } from '@elementor/v1-adapters';

// TODO: Use return type from the TopBar package once merged.
export default function useActionProps() {
	const { isActive, isBlocked } = useRouteStatus( 'panel/editor-preferences' );

	return {
		icon: ToggleRightIcon,
		title: __( 'User Preferences', 'elementor' ),
		onClick: () => openRoute( 'panel/editor-preferences' ),
		selected: isActive,
		disabled: isBlocked,
	};
}
