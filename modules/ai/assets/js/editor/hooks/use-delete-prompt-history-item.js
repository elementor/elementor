import { useState } from 'react';
import { deleteHistoryItem } from '../api';

const useDeletePromptHistoryItem = () => {
	const [ isLoading, setIsLoading ] = useState( false );
	const [ error, setError ] = useState( '' );

	const deleteItem = async ( id ) => new Promise( ( resolve, reject ) => {
		setError( '' );
		setIsLoading( true );

		deleteHistoryItem( id )
			.then( () => {
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
		deleteItem,
	};
};

export default useDeletePromptHistoryItem;
