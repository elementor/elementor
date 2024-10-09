import ReactUtils from 'elementor-utils/react';
import { DirectionProvider, LocalizationProvider, ThemeProvider } from '@elementor/ui';
import PropTypes from 'prop-types';
// import HomeScreen from './components/home-screen';

const App = ( props ) => {
	return (
		<DirectionProvider rtl={ props.isRTL }>
			<LocalizationProvider>
				<ThemeProvider colorScheme={ props.colorScheme }>
					Hello world
				</ThemeProvider>
			</LocalizationProvider>
		</DirectionProvider>
	);
};

const isRTL = elementorCommon.config.isRTL,
	rootElement = document.querySelector( '#wpcontent' );

App.propTypes = {
	isRTL: PropTypes.bool,
	colorScheme: PropTypes.oneOf( [ 'auto', 'light', 'dark' ] ),
};

// We will need to test and tweak the colorScheme.
App.defaultProps = {
	colorScheme: 'auto',
};

ReactUtils.render( (
	<App
		isRTL={ isRTL }
	/>
), rootElement );
