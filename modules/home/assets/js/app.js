import { DirectionProvider, LocalizationProvider } from '@elementor/ui';
import { ThemeProvider } from '@elementor/ui/styles';
import ReactUtils from 'elementor-utils/react';

import HomeScreen from './components/home-screen';

const App = ( props ) => {
	return (
		<DirectionProvider rtl={ props.isRTL }>
			<LocalizationProvider>
				<ThemeProvider colorScheme={ 'light' }>
					<HomeScreen homeScreenData={ props.homeScreenData } />
				</ThemeProvider>
			</LocalizationProvider>
		</DirectionProvider>
	);
};

const isRTL = elementorCommon.config.isRTL,
	rootElement = document.querySelector( '#e-home-screen' );

App.propTypes = {
	isRTL: PropTypes.bool,
	homeScreenData: PropTypes.object,
};

ReactUtils.render( (
	<App
		isRTL={ isRTL }
		homeScreenData={ elementorHomeScreenData }
	/>
), rootElement );
