import ReactUtils from 'elementor-utils/react';
import { DirectionProvider, LocalizationProvider, ThemeProvider } from '@elementor/ui';

const App = ( props ) => {
	return (
		<DirectionProvider rtl={ props.isRTL }>
			<LocalizationProvider>
				<ThemeProvider colorScheme={ 'light' }>
					<h1>Hello world</h1>
				</ThemeProvider>
			</LocalizationProvider>
		</DirectionProvider>
	);
};

const isRTL = elementorCommon.config.isRTL;

let rootElement = document.querySelector( '#e-v4-opt-in-welcome' );

// Create the root element if it doesn't exist
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
