import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { ThemeProvider, DirectionProvider } from '@elementor/ui';
import Launchpad from './launchpad';

const Checklist = ( props ) => {
	const [ isOpen, setIsOpen ] = useState( true );

	useEffect( () => {
		elementor.on( 'elementor/editor/panel/checklist/clicked', () => setIsOpen( prevState => ! prevState ) );

		return () => {
			elementor.off( 'elementor/editor/panel/checklist/clicked', () => setIsOpen( prevState => ! prevState ) );
		};
	}, [ isOpen ] );

	return isOpen
		? (
			<DirectionProvider rtl={ props.isRTL }>
				<ThemeProvider colorScheme="light">
					<Launchpad setIsOpen={ setIsOpen } />
				</ThemeProvider>
			</DirectionProvider>
		)
		: null;
};

export default Checklist;

Checklist.propTypes = {
	isRTL: PropTypes.bool,
};
