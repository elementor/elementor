import { useEffect, useState } from 'react';
import { WhatsNew } from './whats-new';

export const EditorDrawer = () => {
	const [ isOpen, setIsOpen ] = useState( true );

	useEffect( () => {
		elementor.on( 'elementor/editor/panel/whats-new/clicked', () => setIsOpen( true ) );
	}, [] );

	return (
		<WhatsNew
			isOpen={ isOpen }
			setIsOpen={ setIsOpen }
			setIsRead={ () => document.body.classList.remove( 'e-has-notification' ) }
			anchorPosition="left"
		/>
	);
};
