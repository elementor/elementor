import { StructureIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';
import { runCommand, useRouteStatus } from '@elementor/v1-adapters';

export default function useActionProps() {
	const { isActive, isBlocked } = useRouteStatus( 'navigator' );

	return {
		title: __( 'Structure', 'elementor' ),
		icon: StructureIcon,
		onClick: () => runCommand( 'navigator/toggle' ),
		selected: isActive,
		disabled: isBlocked,
	};
}
