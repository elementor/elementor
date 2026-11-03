import {
	DirectionProvider,
	LocalizationProvider,
	ThemeProvider,
} from '@elementor/ui';
import PropTypes from 'prop-types';

import { ModulesScreen } from './components/modules-screen';
import { WelcomeScreen } from './components/welcome-screen';

export const App = ( { isRTL, isActivated, agentDiscoveryConfig, botAccessConfig, browserToolsConfig, llmsConfig, markdownConfig } ) => {
	return (
		<DirectionProvider rtl={ isRTL }>
			<LocalizationProvider>
				<ThemeProvider colorScheme="light" palette="argon-beta">
					{ isActivated ? (
						<ModulesScreen
							agentDiscoveryConfig={ agentDiscoveryConfig }
							botAccessConfig={ botAccessConfig }
							browserToolsConfig={ browserToolsConfig }
							llmsConfig={ llmsConfig }
							markdownConfig={ markdownConfig }
						/>
					) : <WelcomeScreen /> }
				</ThemeProvider>
			</LocalizationProvider>
		</DirectionProvider>
	);
};

App.propTypes = {
	isRTL: PropTypes.bool,
	isActivated: PropTypes.bool,
	agentDiscoveryConfig: PropTypes.object,
	botAccessConfig: PropTypes.object,
	browserToolsConfig: PropTypes.object,
	llmsConfig: PropTypes.object,
	markdownConfig: PropTypes.object,
};
