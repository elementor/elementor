import { ThemeProvider, DirectionProvider, LocalizationProvider } from '@elementor/ui';

import HomeScreen from './components/home-screen';

const App = ( props ) => {
	return (
		<DirectionProvider rtl={ props.isRTL }>
			<LocalizationProvider>
				<ThemeProvider colorScheme={ props.colorScheme }>
					<HomeScreen />
				</ThemeProvider>
			</LocalizationProvider>
		</DirectionProvider>
	);
}

const colorScheme = 'auto', // Is colorScheme available inside the wp admin area?
	isRTL = elementorCommon.config.isRTL,
	rootElement = document.querySelector( '.elementor_page_elementor-home #wpbody-content' );

if ( !! rootElement ) {
	ReactDOM.render( <App // eslint-disable-line react/no-deprecated
		colorScheme={ colorScheme }
		isRTL={ isRTL }
	/>, rootElement);
}
