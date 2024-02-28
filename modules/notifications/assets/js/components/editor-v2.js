import { GiftIcon } from '../icons/gift-icon';
import { editorOnButtonClicked } from './editor-on-button-clicked';
import { Badge } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';

const IconWithBadge = ( { invisible } ) => {
	return (
		<Badge color="primary" variant="dot" invisible={ invisible }>
			<GiftIcon />
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
		priority: 25,
		useProps: () => {
			const [ isRead, setIsRead ] = useState( ! elementorNotifications.is_unread );

			return {
				title: __( "What's New", 'elementor' ),
				icon: () => <IconWithBadge invisible={ isRead } />,
				onClick: () => {
					setIsRead( true );
					elementorNotifications.is_unread = false;

					editorOnButtonClicked( 'right' );
				},
			};
		},
	} );
};
