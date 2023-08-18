import { useState } from 'react';
import { setStatusFeedback } from '../api';
import { produce } from 'immer';

const normalizeResponse = ( { text, response_id: responseId, usage, images } ) => {
	const creditsData = usage ? ( usage.quota - usage.usedQuota ) : 0;
	const credits = Math.max( creditsData, 0 );
	const result = text || images;

	return {
		result,
		responseId,
		credits,
	};
};

const usePrompt = ( fetchData, initialState ) => {
	const [ isLoading, setIsLoading ] = useState( false );
	const [ error, setError ] = useState( '' );
	const [ data, setData ] = useState( initialState );

	const send = async ( ...args ) => new Promise( ( resolve, reject ) => {
		setError( '' );
		setIsLoading( true );

		fetchData( ...args )
			.then( ( result ) => {
				const normalizedData = normalizeResponse( result );

				setData( normalizedData );
				resolve( normalizedData );
			} )
			.catch( ( err ) => {
				const finalError = err?.responseText || err;

				setError( finalError );
				reject( finalError );
			} )
			.finally( () => setIsLoading( false ) );
	} );

	const sendUsageData = ( usageData = data ) => usageData.responseId && setStatusFeedback( usageData.responseId );

	const reset = () => {
		setData( ( { credits } ) => ( { credits, result: '', responseId: '' } ) );
		setError( '' );
		setIsLoading( false );
	};

	const setResult = ( result, responseId = null ) => {
		setData( produce( ( draft ) => {
			draft.result = result;

			if ( responseId ) {
				draft.responseId = responseId;
			}
		} ) );
	};

	return {
		isLoading,
		error,
		data,
		setResult,
		reset,
		send,
		sendUsageData,
	};
};

export default usePrompt;
