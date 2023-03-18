import { __ } from '@wordpress/i18n';
import { runCommand, useRouteStatus } from '@elementor/v1-adapters';
import { ToggleActionProps } from '@elementor/top-bar';
import { AdjustmentsHorizontalIcon } from '@elementor/icons';

export default function useActionProps(): ToggleActionProps {
	const { isActive, isBlocked } = useRouteStatus( 'panel/global', {
		blockOnKitRoutes: false,
	} );

	return {
		title: __( 'Site Settings', 'elementor' ),
		icon: AdjustmentsHorizontalIcon,
		onClick: () => (
			isActive
				? runCommand( 'panel/global/close' )
				: runCommand( 'panel/global/open' )
		),
		selected: isActive,
		disabled: isBlocked,
	};
}
