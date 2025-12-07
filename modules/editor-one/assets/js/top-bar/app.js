import ReactUtils from 'elementor-utils/react';
import { DirectionProvider, LocalizationProvider, ThemeProvider } from '@elementor/ui';
import TopBar from './components/index';
import PropTypes from 'prop-types';

const App = ( { config } ) => {
	return (
		<DirectionProvider rtl={ config.isRTL }>
			<LocalizationProvider>
				<ThemeProvider colorScheme="dark">
					<TopBar config={ config } />
				</ThemeProvider>
			</LocalizationProvider>
		</DirectionProvider>
	);
};

App.propTypes = {
	config: PropTypes.object.isRequired,
};

const rootElement = document.getElementById( 'e-editor-top-bar' );

if ( rootElement && window.elementorTopBarConfig ) {
	ReactUtils.render(
		<App config={ window.elementorTopBarConfig } />,
		rootElement,
	);
}

