import { ThemeProvider, DirectionProvider } from '@elementor/ui';
import Launchpad from './launchpad';
import { useEffect, useState } from 'react';

const Checklist = ( props ) => {
	const [ isOpen, setIsOpen ] = useState( true );

	useEffect( () => {
		elementor.on( 'elementor/editor/panel/checklist/clicked', () => setIsOpen( ! isOpen ) );
	}, [] );

	return isOpen && (
		<DirectionProvider rtl={ props.isRTL }>
			<ThemeProvider colorScheme="light">
				<Launchpad setIsOpen={ setIsOpen } />
			</ThemeProvider>
		</DirectionProvider>
	);
};

export default Checklist;

Checklist.propTypes = {
	isRTL: PropTypes.bool,
};

