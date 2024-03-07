import { DirectionProvider, LocalizationProvider } from '@elementor/ui';
import { ThemeProvider } from '@elementor/ui/styles';

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
};

const isRTL = elementorCommon.config.isRTL,
	rootElement = document.querySelector( '#e-home-screen' ),
	colorScheme = rootElement?.dataset?.ui_theme || 'auto';

App.propTypes = {
	colorScheme: PropTypes.oneOf( [ 'auto', 'light', 'dark' ] ),
	isRTL: PropTypes.bool,
};

ReactDOM.render( <App // eslint-disable-line react/no-deprecated
	colorScheme={ colorScheme }
	isRTL={ isRTL }
/>, rootElement );
