import { UserIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { mainMenu } from '../../locations';
import type { ExtendedWindow } from '../../types';

export function init() {
	const extendedWindow = window as unknown as ExtendedWindow;

	const isUserConnected = extendedWindow.elementor.elementorAdminTopBarConfig?.is_user_connected ?? false;
	const config = isUserConnected
		? {
				id: 'my-elementor',
				// group: 'default',
				priority: 50,
				useProps: () => {
					return {
						title: __( 'My Elementor', 'elementor' ),
						href: 'https://my.elementor.com',
						icon: UserIcon,
						target: '_blank',
					};
				},
		  }
		: {
				id: 'connect',
				// group: 'default',
				priority: 50,
				useProps: () => {
					return {
						title: __( 'Connect & Activate', 'elementor' ),
						href: extendedWindow.elementor.elementorAdminTopBarConfig?.connect_url,
						icon: UserIcon,
						target: '_blank',
					};
				},
		  };

	if ( ! isUserConnected ) {
		mainMenu.registerLink( config );
	}
}
