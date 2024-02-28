import { useEffect, useState } from 'react';
import { WhatsNew } from './whats-new';

export const EditorDrawer = ( { anchorPosition = 'left' } ) => {
	const [ isOpen, setIsOpen ] = useState( true );

	useEffect( () => {
		elementor.on( 'elementor/editor/panel/whats-new/clicked', () => setIsOpen( true ) );
	}, [] );

	return (
		<WhatsNew
			isOpen={ isOpen }
			setIsOpen={ setIsOpen }
			setIsRead={ () => document.body.classList.remove( 'e-has-notification' ) }
			anchorPosition={ anchorPosition }
		/>
	);
};

EditorDrawer.propTypes = {
	anchorPosition: PropTypes.oneOf( [ 'left', 'top', 'right', 'bottom' ] ),
};
