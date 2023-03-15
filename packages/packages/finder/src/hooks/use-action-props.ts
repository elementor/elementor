import { __ } from '@wordpress/i18n';
import { SearchIcon } from '@elementor/icons';
import { runCommand, useRouteStatus } from '@elementor/v1-adapters';

export default function useActionProps() {
	const { isActive, isBlocked } = useRouteStatus( 'finder', {
		blockOnKitRoutes: false,
		blockOnPreviewMode: false,
	} );

	return {
		title: __( 'Finder', 'elementor' ),
		icon: SearchIcon,
		onClick: () => runCommand( 'finder/toggle' ),
		selected: isActive,
		disabled: isBlocked,
	};
}
