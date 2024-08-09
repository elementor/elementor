import { ThemeProvider } from '@elementor/ui';
import Launchpad from './launchpad';
import * as React from 'react';
import { useEffect, useState } from 'react';

const ChecklistApp = () => {
	const [ isOpen, setIsOpen ] = useState( true );

	useEffect( () => {
		elementor.on( 'elementor/editor/panel/checklist/clicked', () => setIsOpen( ! isOpen ) );
	}, [] );

	return (
		<ThemeProvider colorScheme={ 'light' }>
			{ isOpen && <Launchpad
				isOpen={ isOpen }
				setIsOpen={ setIsOpen }
			/> }
		</ThemeProvider>
	);
};

export default ChecklistApp
