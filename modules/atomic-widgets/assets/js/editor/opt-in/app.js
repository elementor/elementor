import ReactUtils from 'elementor-utils/react';
import { DirectionProvider, LocalizationProvider, ThemeProvider } from '@elementor/ui';
import WelcomePopover from './components/welcome-popover';

const App = ( props ) => {
	return (
		<DirectionProvider rtl={ props.isRTL }>
			<LocalizationProvider>
				<ThemeProvider colorScheme={ 'light' }>
					<WelcomePopover />
				</ThemeProvider>
			</LocalizationProvider>
		</DirectionProvider>
	);
};

const isRTL = elementorCommon.config.isRTL;

let rootElement = document.querySelector( '#e-v4-opt-in-welcome' );

if ( ! rootElement ) {
	rootElement = document.createElement( 'div' );
	rootElement.id = 'e-v4-opt-in-welcome';
	document.body.appendChild( rootElement );
}

App.propTypes = {
	isRTL: PropTypes.bool,
};

ReactUtils.render( (
	<App
		isRTL={ isRTL }
	/>
), rootElement );
