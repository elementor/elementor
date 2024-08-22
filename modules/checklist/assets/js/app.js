import { useState } from 'react';
import { ThemeProvider, DirectionProvider } from '@elementor/ui';
import Checklist from './components/checklist';

const App = () => {
	const [ steps, setSteps ] = useState( null );
	const isRTL = elementorCommon.config.isRTL;

	if ( ! steps ) {
		fetch( `${ elementorCommon.config.urls.rest }elementor/v1/checklist/steps`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'X-WP-Nonce': elementorWebCliConfig.nonce,
			},
		} )
			.then( ( response ) => response.json() )
			.then( ( data ) => setSteps( data.data ) )
			.catch( () => {
				return null;
			} );
	}

	if ( ! steps.data || 0 === steps.data.length ) {
		return null;
	}

	return (
		<DirectionProvider rtl={ isRTL }>
			<ThemeProvider colorScheme="light">
				<Checklist steps={ steps.data } />
			</ThemeProvider>
		</DirectionProvider>
	);
};

export default App;
