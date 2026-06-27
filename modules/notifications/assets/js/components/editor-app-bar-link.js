import * as EditorAppBar from '@elementor/editor-app-bar';
import { editorOnButtonClicked } from './editor-on-button-clicked';
import { Box } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import SpeakerphoneIcon from '@elementor/icons/SpeakerphoneIcon';

const floatUpKeyframes = `
@keyframes e-notification-badge-float {
	0%   { transform: translateY( 6px ); opacity: 0; }
	60%  { transform: translateY( -3px ); opacity: 1; }
	100% { transform: translateY( 0 ); opacity: 1; }
}
`;

const badgeSx = {
	position: 'absolute',
	top: -8,
	insetInlineEnd: -8,
	backgroundColor: 'primary.main',
	color: 'primary.contrastText',
	borderRadius: '10px',
	minWidth: '18px',
	height: '18px',
	fontSize: '0.65rem',
	fontWeight: 700,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	lineHeight: 1,
	padding: '0 4px',
	animation: 'e-notification-badge-float 0.45s ease-out 0.3s both',
};

const IconWithBadge = ( { count } ) => {
	return (
		<>
			{ count > 0 && <style>{ floatUpKeyframes }</style> }
			<Box sx={ { position: 'relative', display: 'inline-flex' } }>
				<SpeakerphoneIcon />
				{ count > 0 && (
					<Box component="span" sx={ badgeSx }>
						{ count }
					</Box>
				) }
			</Box>
		</>
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
			const [ unreadCount, setUnreadCount ] = useState( elementorNotifications.unread_count ?? 0 );

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
