import { ThemeProvider } from "@elementor/ui";
import Launchpad from "./launchpad";
import * as React from "react";
import { useEffect, useState } from "react";

const ChecklistApp = () => {
	const [ isOpen, setIsOpen ] = useState(true );

	useEffect( () => {
		if ( ! isOpen ) {
			return;
		}

	}, [ isOpen ] );

	return (
		<ThemeProvider colorScheme={ 'light' }>
			{ isOpen && <Launchpad
				isOpen={ isOpen }
				setIsOpen={ setIsOpen }
			/> }
		</ThemeProvider>
	);
}

export default ChecklistApp
