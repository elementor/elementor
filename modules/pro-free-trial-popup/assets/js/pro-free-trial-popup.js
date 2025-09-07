import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ReactUtils from 'elementor-utils/react';

import {
	DirectionProvider,
	LocalizationProvider,
	ThemeProvider,
} from '@elementor/ui';

import { ProFreeTrialDialog } from './editor-pro-free-trial-dialog';

const App = ( props ) => {
	console.log( props.popupData );
	const [ isDialogVisible, setIsDialogVisible ] = useState( true );

	const handleClose = () => {
		setIsDialogVisible( false );
	};

	return (
		<DirectionProvider rtl={ props.isRTL }>
			<LocalizationProvider>
				<ThemeProvider colorScheme={ 'light' } palette="unstable">
					{
						isDialogVisible && <ProFreeTrialDialog doClose={ handleClose } popupData={ props.popupData } />
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
	let popupRoot = document.querySelector( '#e-pro-free-trial-popup' );

	if ( ! popupRoot ) {
		popupRoot = document.createElement( 'div' );
		popupRoot.id = 'e-pro-free-trial-popup';
		document.body.appendChild( popupRoot );
	}

	return popupRoot;
};

const init = () => {
	if ( ! document.body.classList.contains( 'elementor-editor-active' ) ) {
		return null;
	}

	ReactUtils.render( (
		<App
			isRTL={ !! elementorCommon.config.isRTL }
			popupData={ elementorProFreeTrialData }
		/>
	), getRootElement() );
};

init();