import React, { useState } from 'react';
import ReactUtils from 'elementor-utils/react';
import PropTypes from 'prop-types';

import {
	DirectionProvider,
	LocalizationProvider,
	ThemeProvider,
} from '@elementor/ui';

import { WelcomeDialog } from './welcome-screen';

const App = ( props ) => {
	const [ isWelcomeVisible, setIsWelcomeVisible ] = useState( true );

	const handleClose = () => {
		setIsWelcomeVisible( false );

		if ( window.elementorA11yAnnouncement && window.elementorA11yAnnouncement.ajaxUrl ) {
			const formData = new FormData();
			formData.append( 'action', 'elementor_set_a11y_announcement_dismissed' );
			formData.append( 'nonce', window.elementorA11yAnnouncement.nonce );

			fetch( window.elementorA11yAnnouncement.ajaxUrl, {
				method: 'POST',
				body: formData,
			} ).catch( () => {} );
		}
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
	let popoverRoot = document.querySelector( '#e-a11y-announcement' );

	if ( ! popoverRoot ) {
		popoverRoot = document.createElement( 'div' );
		popoverRoot.id = 'e-a11y-announcement';
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
