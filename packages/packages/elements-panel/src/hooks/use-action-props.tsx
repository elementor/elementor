import { PlusIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';
import { openRoute, useRouteStatus } from '@elementor/v1-adapters';

export default function useActionProps() {
	const { isActive, isBlocked } = useRouteStatus( 'panel/elements' );

	return {
		title: __( 'Add Element', 'elementor' ),
		icon: PlusIcon,
		onClick: () => openRoute( 'panel/elements/categories' ),
		selected: isActive,
		disabled: isBlocked,
	};
}
