import React from 'react';
import ReactUtils from 'elementor-utils/react';

import {
	DirectionProvider,
	LocalizationProvider,
	ThemeProvider,
} from '@elementor/ui';

import { OptIn } from './opt-in';

const App = ( props ) => {
	return (
		<DirectionProvider rtl={ props.isRTL }>
			<LocalizationProvider>
				<ThemeProvider colorScheme={ 'light' }>
					<OptIn state={ props?.state } />
				</ThemeProvider>
			</LocalizationProvider>
		</DirectionProvider>
	);
};

App.propTypes = {
	isRTL: PropTypes.bool,
	state: PropTypes.object,
};

const init = () => {
	const rootElement = document.querySelector( '#page-editor-v4-opt-in' );

	if ( ! rootElement ) {
		return;
	}

	ReactUtils.render( (
		<App
			isRTL={ !! elementorCommon.config.isRTL }
			state={ elementorSettingsEditor4OptIn }
		/>
	), rootElement );
};

init();
