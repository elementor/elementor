import { __ } from '@wordpress/i18n';
import { ThemeBuilderIcon } from '@elementor/icons';
import { runCommand } from '@elementor/v1-adapters';
import { ActionProps } from '@elementor/top-bar';

export default function useActionProps(): ActionProps {
	return {
		icon: ThemeBuilderIcon,
		title: __( 'Theme Builder', 'elementor' ),
		onClick: () => runCommand( 'app/open' ),
	};
}
