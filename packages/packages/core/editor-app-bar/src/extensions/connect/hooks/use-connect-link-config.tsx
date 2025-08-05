import { UserIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { type ExtendedWindow } from '../../../types';

export default function useConnectLinkConfig() {
	const extendedWindow = window as unknown as ExtendedWindow;
	const isUserConnected = extendedWindow?.elementorCommon?.config.library_connect.is_connected ?? false;

	return isUserConnected
		? {
				title: __( 'My Elementor', 'elementor' ),
				href: extendedWindow?.elementor?.config.user.top_bar.my_elementor_url,
				icon: UserIcon,
				target: '_blank',
		  }
		: {
				title: __( 'Connect my account', 'elementor' ),
				href: extendedWindow?.elementor?.config.user.top_bar.connect_url,
				icon: UserIcon,
				target: '_blank',
		  };
}
