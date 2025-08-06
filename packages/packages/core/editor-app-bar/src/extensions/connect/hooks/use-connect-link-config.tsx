import { UserIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';

import { type ExtendedWindow } from '../../../types';

export default function useConnectLinkConfig() {
	const extendedWindow = window as unknown as ExtendedWindow;
	let isUserConnected = false;
	const isPro = extendedWindow?.elementor?.helpers.hasPro();
	let target = '_blank';
	if ( isPro ) {
		isUserConnected = extendedWindow?.elementorPro?.config.isActive ?? false;
	} else {
		isUserConnected = extendedWindow?.elementorCommon?.config.library_connect.is_connected ?? false;
		target = '_self';
	}

	const handleConnectClick = useCallback( ( event: React.MouseEvent<HTMLElement> ) => {
		event.preventDefault();

		if ( extendedWindow.jQuery && extendedWindow.jQuery.fn?.elementorConnect ) {
			const connectUrl = extendedWindow?.elementor?.config.user.top_bar.connect_url;
			const $tempButton = ( extendedWindow as any ).jQuery( '<a>' );
			$tempButton
				?.attr( 'href', connectUrl )
				?.attr( 'target', '_blank' )
				?.attr( 'rel', 'opener' )
				?.css( 'display', 'none' )
				?.appendTo( 'body' );

			$tempButton.elementorConnect();

			$tempButton[0].click();

			setTimeout( () => {
				$tempButton.remove();
			}, 1000 );
		}
	}, [ extendedWindow ] );

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
				target,
				onClick: handleConnectClick,
		  };
}
