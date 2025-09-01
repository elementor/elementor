import React, { useState } from 'react';
import ReactUtils from 'elementor-utils/react';

import {
	DirectionProvider,
	LocalizationProvider,
	ThemeProvider,
} from '@elementor/ui';

import { WelcomeDialog } from './welcome-dialog';

const App = ( props ) => {
	const [ isWelcomeVisible, setIsWelcomeVisible ] = useState( true );

	const handleClose = () => {
		setIsWelcomeVisible( false );
	};

	return (
		<DirectionProvider rtl={ props.isRTL }>
			<LocalizationProvider>
				<ThemeProvider colorScheme={ 'light' } palette="unstable">
					{
						isWelcomeVisible && <WelcomeDialog doClose={ handleClose } />
					}
				</ThemeProvider>
			</LocalizationProvider>
		</DirectionProvider>
	);
};

App.propTypes = {
	isRTL: PropTypes.bool.isRequired,
};

const getRootElement = () => {
	let popoverRoot = document.querySelector( '#e-v4-opt-in-welcome' );

	if ( ! popoverRoot ) {
		popoverRoot = document.createElement( 'div' );
		popoverRoot.id = 'e-v4-opt-in-welcome';
		document.body.appendChild( popoverRoot );
	}

	return popoverRoot;
};

const init = () => {
	if ( ! document.body.classList.contains( 'elementor-editor-active' ) ) {
		return null;
	}

	ReactUtils.render( (
		<App
			isRTL={ !! elementorCommon.config.isRTL }
		/>
	), getRootElement() );
};

init();
