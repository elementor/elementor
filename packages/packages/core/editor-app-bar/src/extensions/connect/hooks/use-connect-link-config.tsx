import { UserIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import type { ExtendedWindow } from '../../../types';

export default function useConnectLinkConfig() {
	const extendedWindow = window as unknown as ExtendedWindow;
	const isUserConnected = extendedWindow?.elementor?.config.library_connect.is_connected ?? false;

	return isUserConnected
		? {
				title: __( 'My Elementor', 'elementor' ),
				href: 'https://go.elementor.com/wp-dash-top-bar-account/',
				icon: UserIcon,
				target: '_blank',
		  }
		: {
				title: __( 'Connect & Activate', 'elementor' ),
				href: extendedWindow?.elementor?.config.user.connect_url,
				icon: UserIcon,
				target: '_blank',
		  };
}
