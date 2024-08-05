import { DirectionProvider, LocalizationProvider, ThemeProvider } from '@elementor/ui';
import ReactUtils from 'elementor-utils/react';

import HomeScreen from './components/home-screen';

const App = ( props ) => {
	return (
		<DirectionProvider rtl={ props.isRTL }>
			<LocalizationProvider>
				<ThemeProvider colorScheme={ 'light' }>
					<HomeScreen
						homeScreenData={ props.homeScreenData }
						adminUrl={ props.adminUrl }
					/>
				</ThemeProvider>
			</LocalizationProvider>
		</DirectionProvider>
	);
};

const isRTL = elementorCommon.config.isRTL,
	adminUrl = elementorAppConfig.admin_url,
	rootElement = document.querySelector( '#e-home-screen' );

App.propTypes = {
	isRTL: PropTypes.bool,
	adminUrl: PropTypes.string,
	homeScreenData: PropTypes.object,
};

ReactUtils.render( (
	<App
		isRTL={ isRTL }
		homeScreenData={ elementorHomeScreenData }
		adminUrl={ adminUrl }
	/>
), rootElement );
