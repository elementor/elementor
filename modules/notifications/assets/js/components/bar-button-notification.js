import { useEffect, useState } from 'react';
import { WhatsNew } from './whats-new';
import { Badge } from '@elementor/ui';

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
			<button
				className="e-admin-top-bar__bar-button"
				style={ {
					backgroundColor: 'transparent',
					border: 'none',
				} }
				onClick={ handleOpen }
			>
				<Badge
					color="primary"
					badgeContent={ unreadCount }
					invisible={ 0 === unreadCount }
					sx={ { mx: 0.5 } }
				>
					<i className="e-admin-top-bar__bar-button-icon eicon-speakerphone"></i>
				</Badge>
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
