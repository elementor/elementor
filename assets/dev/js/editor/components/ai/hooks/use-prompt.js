import { useState } from 'react';
import { setStatusFeedback } from '../api';

const usePrompt = ( fetchData, config = {} ) => {
	const [ prompt, setPrompt ] = useState( config.initialPrompt || '' );
	const [ result, setResult ] = useState( () => config.initialResult || '' );
	const [ error, setError ] = useState( '' );
	const [ responseId, setResponseId ] = useState( '' );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ credits, setCredits ] = useState( config.initialCredits || 0 );

	const send = async ( ...args ) => {
		setIsLoading( true );
		setError( '' );

		try {
			const promptResult = await fetchData( ...args );
			const creditsData = promptResult.usage ? ( promptResult.usage.quota - promptResult.usage.usedQuota ) : 0;
			const currentCredits = creditsData < 0 ? 0 : creditsData;

			setResult( promptResult.text );
			setResponseId( promptResult.response_id );
			setCredits( currentCredits );
		} catch ( promptError ) {
			setError( promptError?.responseText || promptError );
		}

		setIsLoading( false );
	};

	const sendFeedback = () => {
		if ( responseId ) {
			setStatusFeedback( responseId );
		}
	};

	const resetError = () => setError( '' );

	return {
		prompt,
		setPrompt,
		isLoading,
		error,
		resetError,
		result,
		setResult,
		send,
		sendFeedback,
		credits,
	};
};

export default usePrompt;
