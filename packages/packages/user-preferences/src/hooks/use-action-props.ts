import { __ } from '@wordpress/i18n';
import { ToggleActionProps } from '@elementor/top-bar';
import { ToggleRightIcon } from '@elementor/icons';
import { openRoute, useRouteStatus } from '@elementor/v1-adapters';

export default function useActionProps(): ToggleActionProps {
	const { isActive, isBlocked } = useRouteStatus( 'panel/editor-preferences' );

	return {
		icon: ToggleRightIcon,
		title: __( 'User Preferences', 'elementor' ),
		onClick: () => openRoute( 'panel/editor-preferences' ),
		selected: isActive,
		disabled: isBlocked,
	};
}
