import { useCallback } from 'react';
import { UserIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { type ExtendedWindow } from '../../../types';

const dispatchConnectClickEvent = ( eventName: string ) => {
	try {
		const extendedWindow = window as unknown as ExtendedWindow;
		const config = extendedWindow?.elementorCommon?.eventsManager?.config;

		if ( config ) {
			extendedWindow.elementorCommon.eventsManager.dispatchEvent( config.names.topBar[ eventName ], {
				location: config.locations.topBar,
				secondaryLocation: config.secondaryLocations.eLogoMenu,
				trigger: config.triggers.dropdownClick,
				element: config.elements.buttonIcon,
			} );
		}
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.warn( error );
	}
};

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

	const handleConnectClick = useCallback(
		( event: React.MouseEvent< HTMLElement > ) => {
			event.preventDefault();

			if ( extendedWindow.jQuery && extendedWindow.jQuery.fn?.elementorConnect ) {
				const connectUrl = extendedWindow?.elementor?.config.user.top_bar.connect_url;
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const $tempButton = ( extendedWindow as any ).jQuery( '<a>' );
				$tempButton
					?.attr( 'href', connectUrl )
					?.attr( 'target', '_blank' )
					?.attr( 'rel', 'opener' )
					?.css( 'display', 'none' )
					?.appendTo( 'body' );

				$tempButton.elementorConnect( {
					success: () => {
						dispatchConnectClickEvent( 'accountConnected' );
						extendedWindow.location.reload();
					},
				} );

				$tempButton[ 0 ].click();
				dispatchConnectClickEvent( 'connectAccount' );

				setTimeout( () => {
					$tempButton.remove();
				}, 1000 );
			}
		},
		[ extendedWindow ]
	);

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
