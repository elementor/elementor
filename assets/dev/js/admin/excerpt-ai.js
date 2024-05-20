import React, { useEffect, useState } from 'react';
import App from '../../../../modules/ai/assets/js/editor/app';
import LoaderAI from '../../../../modules/ai/assets/js/editor/loader';
import { ThemeProvider } from '@elementor/ui';
import PropTypes from 'prop-types';

const GenerateExcerptWithAI = ( { onClose } ) => {
	const [ isLoading, setIsLoading ] = useState( true );
	const isRTL = false; // Assuming you have a way to determine if it's RTL

	useEffect( () => {
		// Simulate a server call
		// fetch( '/api/your-endpoint' )
		// 	.then( ( response ) => response.json() )
		// 	.then( ( data ) => {
		// 		// Handle the data
		// 		console.log( data );
		// 		setIsLoading( false );
		// 	} )
		// 	.catch( ( error ) => {
		// 		console.error( 'Error fetching data:', error );
		// 		setIsLoading( false ); // Set to false even if there is an error to stop loading spinner
		// 	} );
		setTimeout( () => {
			setIsLoading( false );
		}, 2000 );
	}, [] );

	return (
		<>

			{ isLoading && ( <ThemeProvider colorScheme={ 'auto' }>
				<LoaderAI type={ 'text' } onClose={ onClose } title={ __( 'Analyzing your post to craft an excerpt...', 'elementor' ) } />
			</ThemeProvider> ) }
			{ ! isLoading &&
			( <App
				type={ 'text' }
				getControlValue={ () => 'dsdsds' }
				setControlValue={ ( value ) => console.log( value ) }
				onClose={ onClose }
				isRTL={ isRTL }
			/> ) }
		</>
	);
};

GenerateExcerptWithAI.propTypes = {
	onClose: PropTypes.func.isRequired,
};

export default GenerateExcerptWithAI;
