import ReactUtils from 'elementor-utils/react';
import { DirectionProvider, LocalizationProvider, ThemeProvider } from '@elementor/ui';
import WelcomePopover from './components/welcome-popover';
import { useState } from 'react';

const App = ( props ) => {
	const [ open, setOpen ] = useState( true );

	const handleClose = () => {
		setOpen( false );
	};

	return (
		<DirectionProvider rtl={ props.isRTL }>
			<LocalizationProvider>
				<ThemeProvider colorScheme={ 'light' }>
					<>
						{ open && <WelcomePopover doClose={ handleClose } /> }
					</>
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
