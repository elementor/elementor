import { useEffect, useState } from 'react';
import { WhatsNew } from './whats-new';
import { Box } from '@elementor/ui';

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

export const BarButtonNotification = ( props ) => {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ unreadCount, setUnreadCount ] = useState( window.elementorNotifications?.unread_count ?? 0 );

	useEffect( () => {
		const handler = () => setUnreadCount( ( prev ) => Math.max( 0, prev - 1 ) );
		window.addEventListener( 'e-notification-item-seen', handler );
		return () => window.removeEventListener( 'e-notification-item-seen', handler );
	}, [] );

	const handleOpen = ( event ) => {
		event.preventDefault();
		setIsOpen( true );
	};

	// TODO: This is a temporary solution until we have a proper admin bar component.
	return (
		<>
			{ unreadCount > 0 && <style>{ floatUpKeyframes }</style> }
			<button
				className="e-admin-top-bar__bar-button"
				style={ {
					backgroundColor: 'transparent',
					border: 'none',
				} }
				onClick={ handleOpen }
			>
				<Box sx={ { mx: 0.5, position: 'relative', display: 'inline-flex' } }>
					<i className="e-admin-top-bar__bar-button-icon eicon-speakerphone"></i>
					{ unreadCount > 0 && (
						<Box component="span" sx={ badgeSx }>
							{ unreadCount }
						</Box>
					) }
				</Box>
				<span className="e-admin-top-bar__bar-button-title">
					{ props.children }
				</span>
			</button>
			<WhatsNew isOpen={ isOpen } setIsOpen={ setIsOpen } setIsRead={ () => {} } />
		</>
	);
};

BarButtonNotification.propTypes = {
	children: PropTypes.any.isRequired,
};
