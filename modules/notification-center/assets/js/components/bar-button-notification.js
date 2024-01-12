import { useState } from 'react';
import BarButton from 'elementor/modules/admin-top-bar/assets/js/components/bar-button/bar-button';
import { WhatsNew } from './whats-new';
import { items } from '../items';
import { Badge, Button } from '@elementor/ui';
import { GiftIcon } from '../icons/gift-icon';

export const BarButtonNotification = ( props ) => {
	const [ isOpen, setIsOpen ] = useState( true );
	const [ isRead, setIsRead ] = useState( false );

	// TODO: This is a temporary solution until we have a proper admin bar component.
	return (
		<>
			<a
				href="#"
				className="e-admin-top-bar__bar-button"
				onClick={ () => setIsOpen( true ) }
				{ ...props }
			>
				<Badge
					color="primary"
					variant="dot"
					invisible={ isRead }
					sx={ {
						marginInline: '4px',
					} }
				>
					<GiftIcon
						fontSize="13px"
					/>
				</Badge>
				<span className="e-admin-top-bar__bar-button-title">
					{ props.children }
				</span>
			</a>
			<WhatsNew items={ items } isOpen={ isOpen } setIsOpen={ setIsOpen } onWhatever={ setIsRead } />
		</>
	);
};
