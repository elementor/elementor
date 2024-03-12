import { DirectionProvider, LocalizationProvider } from '@elementor/ui';
import { ThemeProvider } from '@elementor/ui/styles';
import ReactUtils from 'elementor-utils/react';

import HomeScreen from './components/home-screen';

const App = ( props ) => {
	return (
		<DirectionProvider rtl={ props.isRTL }>
			<LocalizationProvider>
				<ThemeProvider colorScheme={ props.colorScheme }>
					<HomeScreen homeScreenData={ props.homeScreenData } />
				</ThemeProvider>
			</LocalizationProvider>
		</DirectionProvider>
	);
};

const isRTL = elementorCommon.config.isRTL,
	rootElement = document.querySelector( '#e-home-screen' ),
	colorScheme = rootElement?.dataset?.uiTheme || 'auto';

App.propTypes = {
	colorScheme: PropTypes.oneOf( [ 'auto', 'light', 'dark' ] ),
	isRTL: PropTypes.bool,
	homeScreenData: PropTypes.object,
};

ReactUtils.render( (
	<App
		colorScheme={ colorScheme }
		isRTL={ isRTL }
		homeScreenData={ elementorHomeScreenData }
	/>
), rootElement );
