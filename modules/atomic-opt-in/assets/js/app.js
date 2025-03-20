import React, { useState } from 'react';
import ReactUtils from 'elementor-utils/react';

import {
	DirectionProvider,
	LocalizationProvider,
	ThemeProvider,
} from '@elementor/ui';

import { AdminTab } from './components/admin-tab';
import { WelcomePopover } from './components/welcome-popover';

const App = ( props ) => {
	const [ isWelcomeVisible, setIsWelcomeVisible ] = useState( true );

	const handleClose = () => {
		setIsWelcomeVisible( false );
	};

	const isAdminTab = 'adminTab' === props.contentType;

	return (
		<DirectionProvider rtl={ props.isRTL }>
			<LocalizationProvider>
				<ThemeProvider colorScheme={ 'light' }>
					{
						isAdminTab
							? <AdminTab state={ props?.state } />
							: isWelcomeVisible && <WelcomePopover doClose={ handleClose } />
					}
				</ThemeProvider>
			</LocalizationProvider>
		</DirectionProvider>
	);
};

App.propTypes = {
	isRTL: PropTypes.bool.isRequired,
	state: PropTypes.object,
	contentType: PropTypes.string.isRequired,
};

const getRootElement = () => {
	const v4AdminTab = document.querySelector( '#page-editor-v4-opt-in' );

	if ( v4AdminTab ) {
		return { rootElement: v4AdminTab, contentType: 'adminTab' };
	}

	if ( ! document.body.classList.contains( 'elementor-editor-active' ) ) {
		return null;
	}

	let popoverRoot = document.querySelector( '#e-v4-opt-in-welcome' );

	if ( ! popoverRoot ) {
		popoverRoot = document.createElement( 'div' );
		popoverRoot.id = 'e-v4-opt-in-welcome';
		document.body.appendChild( popoverRoot );
	}

	return { rootElement: popoverRoot, contentType: 'popover' };
};

const init = () => {
	const rootData = getRootElement();

	if ( ! rootData ) {
		return;
	}

	const { rootElement, contentType } = rootData;

	ReactUtils.render( (
		<App
			isRTL={ !! elementorCommon.config.isRTL }
			state={ elementorSettingsEditor4OptIn }
			contentType={ contentType }
		/>
	), rootElement );
};

init();
