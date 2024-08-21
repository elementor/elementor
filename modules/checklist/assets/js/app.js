import { useState } from 'react';
import { ThemeProvider, DirectionProvider } from '@elementor/ui';
import Checklist from './components/checklist';

const App = () => {
	const [ steps, setSteps ] = useState( null );
	const isRTL = elementorCommon.config.isRTL;

	if ( ! steps ) {
		fetch( `${ elementorCommon.config.urls.rest }elementor/v1/checklist/steps` )
			.then( ( response ) => response.json() )
			.then( ( data ) => setSteps( data ) )
			.catch( () => {
				return null;
			} );
	}

	if ( ! steps ) {
		return null;
	}

	return (
		<DirectionProvider rtl={ isRTL }>
			<ThemeProvider colorScheme="light">
				<Checklist steps={ steps } />
			</ThemeProvider>
		</DirectionProvider>
	);
};

export default App;
