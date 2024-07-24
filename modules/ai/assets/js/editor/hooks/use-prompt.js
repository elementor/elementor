import { useEffect, useState } from 'react';
import { setStatusFeedback } from '../api';
import { useRequestIds } from '../context/requests-ids';

const normalizeResponse = ( { text, response_id: responseId, usage, images, ...optional } ) => {
	const creditsData = usage ? ( usage.quota - usage.usedQuota ) : 0;
	const credits = Math.max( creditsData, 0 );
	const result = text || images;

	const normalized = {
		result,
		responseId,
		credits,
		usagePercentage: usage?.usagePercentage,
	};

	if ( optional.base_template_id ) {
		normalized.baseTemplateId = optional.base_template_id;
	}

	normalized.type = optional.template_type;

	return normalized;
};

const usePrompt = ( fetchData, initialState ) => {
	const [ isLoading, setIsLoading ] = useState( false );
	const [ error, setError ] = useState( '' );
	const [ data, setData ] = useState( initialState );
	const { updateUsagePercentage, usagePercentage } = useRequestIds();

	useEffect( () => {
		const newUsageValue = data?.usagePercentage;
		if ( newUsageValue && newUsageValue !== usagePercentage ) {
			updateUsagePercentage( newUsageValue );
		}
	}, [ data, usagePercentage, updateUsagePercentage ] );

	const { setRequest, editorSessionId, sessionId, generateId, batchId } = useRequestIds();

	const send = async ( payload ) => new Promise( ( resolve, reject ) => {
		setError( '' );
		setIsLoading( true );
		const requestId = setRequest();

		const requestIds = {
			editorSessionId: editorSessionId.current,
			sessionId: sessionId.current,
			generateId: generateId.current,
			batchId: batchId.current,
			requestId: requestId.current,
		};

		payload = { ...payload, requestIds };

		fetchData( payload )
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
		const updatedResult = { ...data };

		updatedResult.result = result;

		if ( responseId ) {
			updatedResult.responseId = responseId;
		}

		setData( updatedResult );
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
