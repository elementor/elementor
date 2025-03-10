import { useState } from 'react';
import { WhatsNew } from './whats-new';
import { Badge } from '@elementor/ui';

export const BarButtonNotification = ( props ) => {
	const { defaultIsRead } = props;

	const [ isOpen, setIsOpen ] = useState( false );
	const [ isRead, setIsRead ] = useState( defaultIsRead );

	// TODO: This is a temporary solution until we have a proper admin bar component.
	return (
		<>
			<button
				className="e-admin-top-bar__bar-button"
				style={ {
					backgroundColor: 'transparent',
					border: 'none',
				} }
				onClick={ ( event ) => {
					event.preventDefault();

					setIsOpen( true );
				} }
			>
				<Badge
					color="primary"
					variant="dot"
					invisible={ isRead }
					sx={ {
						mx: 0.5,
					} }
				>
					<i className="e-admin-top-bar__bar-button-icon eicon-speakerphone"></i>
				</Badge>
				<span className="e-admin-top-bar__bar-button-title">
					{ props.children }
				</span>
			</button>
			<WhatsNew isOpen={ isOpen } setIsOpen={ setIsOpen } setIsRead={ setIsRead } />
		</>
	);
};

BarButtonNotification.propTypes = {
	defaultIsRead: PropTypes.bool,
	children: PropTypes.any.isRequired,
};
