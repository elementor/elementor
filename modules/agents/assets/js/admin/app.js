import {
	DirectionProvider,
	LocalizationProvider,
	ThemeProvider,
} from '@elementor/ui';
import PropTypes from 'prop-types';

import { TabbedScreen } from './components/tabbed-screen';
import { WelcomeScreen } from './components/welcome-screen';

export const App = ( { isRTL, isExperimentActive } ) => {
	return (
		<DirectionProvider rtl={ isRTL }>
			<LocalizationProvider>
				<ThemeProvider colorScheme="light">
					{ isExperimentActive ? <TabbedScreen /> : <WelcomeScreen /> }
				</ThemeProvider>
			</LocalizationProvider>
		</DirectionProvider>
	);
};

App.propTypes = {
	isRTL: PropTypes.bool,
	isExperimentActive: PropTypes.bool,
};
