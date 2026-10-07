import {
	DirectionProvider,
	LocalizationProvider,
	ThemeProvider,
} from '@elementor/ui';
import PropTypes from 'prop-types';

import { ModulesScreen } from './components/modules-screen';
import { WelcomeScreen } from './components/welcome-screen';

export const App = ( { isRTL, isExperimentActive, llmsConfig, markdownConfig } ) => {
	return (
		<DirectionProvider rtl={ isRTL }>
			<LocalizationProvider>
				<ThemeProvider colorScheme="light" palette="argon-beta">
					{ isExperimentActive ? <ModulesScreen llmsConfig={ llmsConfig } markdownConfig={ markdownConfig } /> : <WelcomeScreen /> }
				</ThemeProvider>
			</LocalizationProvider>
		</DirectionProvider>
	);
};

App.propTypes = {
	isRTL: PropTypes.bool,
	isExperimentActive: PropTypes.bool,
	llmsConfig: PropTypes.object,
	markdownConfig: PropTypes.object,
};
