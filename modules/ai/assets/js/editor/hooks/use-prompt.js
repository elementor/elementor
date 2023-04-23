import { useState } from 'react';
import { setStatusFeedback } from '../api';

const normalizeResponse = ( { text, response_id: responseId, usage } ) => {
	const creditsData = usage ? ( usage.quota - usage.usedQuota ) : 0;
	const credits = Math.max( creditsData, 0 );

	return {
		result: text,
		responseId,
		credits,
	};
};

const usePrompt = ( fetchData, initialState ) => {
	const [ isLoading, setIsLoading ] = useState( false );
	const [ error, setError ] = useState( '' );
	const [ data, setData ] = useState( initialState );

	const send = async ( ...args ) => {
		setError( '' );
		setIsLoading( true );

		fetchData( ...args )
			.then( ( result ) => setData( normalizeResponse( result ) ) )
			.catch( ( err ) => setError( err?.responseText || err ) )
			.finally( () => setIsLoading( false ) );
	};

	const sendUsageData = () => data.responseId && setStatusFeedback( data.responseId );

	const reset = () => {
		setData( ( { credits } ) => ( { credits, result: '', responseId: '' } ) );
		setError( '' );
		setIsLoading( false );
	};

	return {
		isLoading,
		error,
		data,
		reset,
		send,
		sendUsageData,
	};
};

export default usePrompt;
