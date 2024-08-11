import { ThemeProvider } from '@elementor/ui';
import Launchpad from './launchpad';
import * as React from 'react';
import { useEffect, useState } from 'react';

const Checklist = () => {
	const [ isOpen, setIsOpen ] = useState( true );

	useEffect( () => {
		elementor.on( 'elementor/editor/panel/checklist/clicked', () => setIsOpen( ! isOpen ) );
	}, [] );

	if ( isOpen ) {
		return (
			<ThemeProvider colorScheme={ 'light' }>
				<Launchpad
					isOpen={ isOpen }
					setIsOpen={ setIsOpen }
				/>
			</ThemeProvider>
		);
	} else {
		return null
	}
};

export default Checklist;
