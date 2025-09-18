import * as EditorAppBar from '@elementor/editor-app-bar';
import { editorOnButtonClicked } from './editor-on-button-clicked';
import { Badge } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import SpeakerphoneIcon from '@elementor/icons/SpeakerphoneIcon';

const IconWithBadge = ( { invisible } ) => {
	return (
		<Badge color="primary" variant="dot" invisible={ invisible }>
			<SpeakerphoneIcon />
		</Badge>
	);
};

IconWithBadge.propTypes = {
	invisible: PropTypes.bool,
};

export const editorAppBarLink = () => {
	const { utilitiesMenu } = EditorAppBar;

	utilitiesMenu.registerLink( {
		id: 'app-bar-menu-item-whats-new',
		priority: 10,
		useProps: () => {
			const [ isRead, setIsRead ] = useState( ! elementorNotifications.is_unread );

			return {
				title: __( "What's New", 'elementor' ),
				icon: () => <IconWithBadge invisible={ isRead } />,
				onClick: () => {
					elementorCommon.eventsManager.dispatchEvent(
						elementorCommon.eventsManager.config.names.topBar.whatsNew,
						{
							location: elementorCommon.eventsManager.config.locations.topBar,
							secondaryLocation: elementorCommon.eventsManager.config.secondaryLocations[ 'whats-new' ],
							trigger: elementorCommon.eventsManager.config.triggers.click,
						},
					);

					setIsRead( true );
					elementorNotifications.is_unread = false;

					editorOnButtonClicked( 'right' );
				},
			};
		},
	} );
};
