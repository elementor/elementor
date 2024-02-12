import { useEffect, useState } from 'react';
import { WhatsNew } from './whats-new';

export const EditorDrawer = () => {
	const [ isOpen, setIsOpen ] = useState( true );
	const [ isRead, setIsRead ] = useState( false );

	useEffect( () => {
		elementor.on( 'elementor/editor/panel/whats-new/clicked', () => setIsOpen( true ) );
	}, [] );

	useEffect( () => {
		document.body.classList.remove( 'e-has-notification' );
	}, [ isRead ] );

	return (
		<WhatsNew
			isOpen={ isOpen }
			setIsOpen={ setIsOpen }
			setIsRead={ setIsRead }
			anchorPosition="left"
		/>
	);
};
