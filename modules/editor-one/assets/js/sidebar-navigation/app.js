import ReactUtils from 'elementor-utils/react';
import { DirectionProvider, LocalizationProvider, ThemeProvider } from '@elementor/ui';
import SidebarNavigation from './components/index';
import PropTypes from 'prop-types';

const App = ( { config } ) => {
	return (
		<DirectionProvider rtl={ config.isRTL }>
			<LocalizationProvider>
				<ThemeProvider colorScheme="light">
					<SidebarNavigation config={ config } />
				</ThemeProvider>
			</LocalizationProvider>
		</DirectionProvider>
	);
};

App.propTypes = {
	config: PropTypes.object.isRequired,
};

const rootElement = document.getElementById( 'editor-one-sidebar-navigation' );

if ( rootElement && window.editorOneSidebarConfig ) {
	ReactUtils.render(
		<App config={ window.editorOneSidebarConfig } />,
		rootElement,
	);
}

