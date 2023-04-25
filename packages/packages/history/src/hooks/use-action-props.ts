import { HistoryIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';
import { openRoute, useRouteStatus } from '@elementor/v1-adapters';

export default function useActionProps() {
	const { isActive, isBlocked } = useRouteStatus( 'panel/history' );

	return {
		title: __( 'History', 'elementor' ),
		icon: HistoryIcon,
		onClick: () => openRoute( 'panel/history/actions' ),
		selected: isActive,
		disabled: isBlocked,
	};
}
