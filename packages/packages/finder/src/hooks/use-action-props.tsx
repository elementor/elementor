import { __ } from '@wordpress/i18n';
import FinderIcon from '../icons/finder-icon';
import { runCommand, useRouteStatus } from '@elementor/v1-adapters';

export default function useActionProps() {
	const { isActive, isBlocked } = useRouteStatus( 'finder' );

	return {
		title: __( 'Finder', 'elementor' ),
		icon: FinderIcon,
		onClick: () => runCommand( 'finder/toggle' ),
		selected: isActive,
		disabled: isBlocked,
	};
}
