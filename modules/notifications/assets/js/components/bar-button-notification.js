import { useState } from 'react';
import { WhatsNew } from './whats-new';
import { Badge } from '@elementor/ui';
import { GiftIcon } from '../icons/gift-icon';

export const BarButtonNotification = ( props ) => {
	const { defaultIsRead } = props;

	const [ isOpen, setIsOpen ] = useState( false );
	const [ isRead, setIsRead ] = useState( defaultIsRead );

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
			<WhatsNew isOpen={ isOpen } setIsOpen={ setIsOpen } onWhatever={ setIsRead } />
		</>
	);
};
