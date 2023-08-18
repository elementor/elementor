import { useState } from 'react';
import { getHistory } from '../api';

const normalizeItems = ( items ) => {
	return items?.map( ( item ) => {
		return {
			id: item?.elementorApiId,
			date: item?.createdAt,
			action: item?.action,
			prompt: item?.request?.prompt,
			result: item?.response?.results?.text,
		};
	} );
};

const usePromptHistory = ( { promptType, page, limit } ) => {
	const [ isLoading, setIsLoading ] = useState( false );
	const [ data, setData ] = useState( [] );
	const [ error, setError ] = useState( '' );

	const send = async () => new Promise( ( resolve, reject ) => {
		setIsLoading( true );

		getHistory( promptType, page, limit )
			.then( ( history ) => {
				setData( history );
				resolve( true );
			} )
			.catch( ( err ) => {
				const finalError = err?.responseText || err;

				setError( finalError );
				reject( finalError );
			} )
			.finally( () => setIsLoading( false ) );
	} );

	return {
		isLoading,
		error,
		items: normalizeItems( data.items ),
		meta: data.meta,
		send,
	};
};

export default usePromptHistory;
