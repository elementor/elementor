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

export const editorV2 = () => {
	const { utilitiesMenu } = window.elementorV2.editorAppBar;

	utilitiesMenu.registerLink( {
		id: 'app-bar-menu-item-whats-new',
		priority: 10,
		useProps: () => {
			const [ isRead, setIsRead ] = useState( ! elementorNotifications.is_unread );

			return {
				title: __( "What's New", 'elementor' ),
				icon: () => <IconWithBadge invisible={ isRead } />,
				onClick: () => {
					elementor.editorEvents.dispatchEvent(
						elementor.editorEvents.config.names.topBar.whatsNew,
						{
							location: elementor.editorEvents.config.locations.topBar,
							secondaryLocation: elementor.editorEvents.config.secondaryLocations[ 'whats-new' ],
							trigger: elementor.editorEvents.config.triggers.click,
							element: elementor.editorEvents.config.elements.buttonIcon,
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
