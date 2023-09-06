import { useState } from 'react';
import { getHistory } from '../api';
import { produce } from 'immer';

const normalizeItems = ( items ) => {
	return items?.map( ( item ) => {
		return {
			id: item?.elementorApiId,
			date: item?.createdAt,
			action: item?.action,
			prompt: item?.request?.prompt,
			text: item?.response?.results?.text,
			images: item?.response?.results?.images,
		};
	} );
};

const usePromptHistory = ( promptType ) => {
	const [ isLoading, setIsLoading ] = useState( false );
	const [ data, setData ] = useState( {} );
	const [ error, setError ] = useState( '' );

	const send = async ( { page, limit } ) => new Promise( ( resolve, reject ) => {
		setIsLoading( true );

		getHistory( promptType, page, limit )
			.then( ( response ) => {
				setData( produce( ( draft ) => {
					draft.meta = response.meta;
					draft.items = [ ...draft?.items || [], ...normalizeItems( response.items ) ];

					return draft;
				} ) );

				resolve( true );
			} )
			.catch( ( err ) => {
				const finalError = err?.responseText || err;

				setError( finalError );
				reject( finalError );
			} )
			.finally( () => setIsLoading( false ) );
	} );

	const deleteItemById = ( id ) => {
		const itemIndex = data.items.findIndex( ( item ) => item.id === id );

		if ( -1 === itemIndex ) {
			return false;
		}

		setData( produce( ( draft ) => {
			draft.items.splice( itemIndex, 1 );

			return draft;
		} ) );

		return true;
	};

	return {
		isLoading,
		error,
		items: data.items,
		meta: data.meta,
		send,
		deleteItemById,
	};
};

export default usePromptHistory;
