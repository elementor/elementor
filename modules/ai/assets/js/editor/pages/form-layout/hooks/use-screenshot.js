import { useState } from 'react';
import useLayoutPrompt from './use-layout-prompt';

const ERROR_INITIAL_VALUE = '';

const useScreenshot = ( type, onData ) => {
	const [ error, setError ] = useState( ERROR_INITIAL_VALUE );
	const [ isLoading, setIsLoading ] = useState( false );

	const layoutData = useLayoutPrompt( type, null );

	const generate = ( requestBody, signal ) => {
		setIsLoading( true );
		setError( ERROR_INITIAL_VALUE );

		return layoutData.send( requestBody, signal )
			.then( async ( data ) => {
				const createdScreenshot = await onData( data.result );

				createdScreenshot.sendUsageData = () => layoutData.sendUsageData( data );
				createdScreenshot.baseTemplateId = data.baseTemplateId;
				createdScreenshot.type = data.type;

				return createdScreenshot;
			} )
			.catch( ( err ) => {
				setError( err.message || err );

				throw err;
			} )
			.finally( () => setIsLoading( false ) );
	};

	return {
		generate,
		error,
		isLoading,
	};
};

export default useScreenshot;
