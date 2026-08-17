import { type ActionProps } from '@elementor/editor-app-bar';
import { TextIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { EVENT_REQUEST_OPEN_DEFAULT_STYLES } from '../default-styles-open-gate';

export function useDefaultStylesActionProps(): ActionProps {
	return {
		title: __( 'Default Styles', 'elementor' ),
		icon: TextIcon,
		onClick: () => {
			window.dispatchEvent( new CustomEvent( EVENT_REQUEST_OPEN_DEFAULT_STYLES ) );
		},
	};
}
