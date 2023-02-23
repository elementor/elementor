import { __ } from '@wordpress/i18n';
import { runCommand, useRouteStatus } from '@elementor/v1-adapters';
import SettingsIcon from '../icons/settings-icon';
import { ToggleActionProps } from '@elementor/top-bar';

export default function useActionProps(): ToggleActionProps {
	const { isActive, isBlocked } = useRouteStatus( 'panel/global', {
		blockOnKitRoutes: false,
	} );

	return {
		title: __( 'Site settings', 'elementor' ),
		icon: SettingsIcon,
		onClick: () => (
			isActive
				? runCommand( 'panel/global/close' )
				: runCommand( 'panel/global/open' )
		),
		selected: isActive,
		disabled: isBlocked,
	};
}
