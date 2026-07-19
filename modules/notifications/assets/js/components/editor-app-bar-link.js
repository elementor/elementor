import * as EditorAppBar from '@elementor/editor-app-bar';
import { editorOnButtonClicked } from './editor-on-button-clicked';
import { Badge } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import SpeakerphoneIcon from '@elementor/icons/SpeakerphoneIcon';

const IconWithBadge = ( { count } ) => {
	return (
		<Badge color="primary" badgeContent={ count } invisible={ 0 === count }>
			<SpeakerphoneIcon />
		</Badge>
	);
};

IconWithBadge.propTypes = {
	count: PropTypes.number,
};

export const editorAppBarLink = () => {
	const { utilitiesMenu } = EditorAppBar;

	utilitiesMenu.registerLink( {
		id: 'app-bar-menu-item-whats-new',
		priority: 10,
		useProps: () => {
			const [ unreadCount, setUnreadCount ] = useState( parseInt( window.elementorNotifications?.unread_count, 10 ) || 0 );

			useEffect( () => {
				const handler = () => setUnreadCount( ( prev ) => Math.max( 0, prev - 1 ) );
				window.addEventListener( 'e-notification-item-seen', handler );
				return () => window.removeEventListener( 'e-notification-item-seen', handler );
			}, [] );

			return {
				title: __( "What's New", 'elementor' ),
				icon: () => <IconWithBadge count={ unreadCount } />,
				onClick: () => {
					elementorCommon.eventsManager.dispatchEvent(
						elementorCommon.eventsManager.config.names.topBar.whatsNew,
						{
							location: elementorCommon.eventsManager.config.locations.topBar,
							secondaryLocation: elementorCommon.eventsManager.config.secondaryLocations[ 'whats-new' ],
							trigger: elementorCommon.eventsManager.config.triggers.click,
							element: elementorCommon.eventsManager.config.elements.buttonIcon,
						},
					);

					editorOnButtonClicked( 'right' );
				},
			};
		},
	} );
};
