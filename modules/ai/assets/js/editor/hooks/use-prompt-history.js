import { useState } from 'react';
import { getHistory } from '../api';

const getImageThumbnailURL = ( base, imageURL ) => {
	if ( ! base ) {
		return imageURL;
	}

	return `${ base }/?o=${ btoa( imageURL, false ) }`;
};

const normalizeItems = ( response ) => {
	const { meta, items } = response;

	return items?.map( ( item ) => {
		return {
			id: item?.elementorApiId,
			date: item?.createdAt,
			action: item?.action,
			prompt: item?.request?.prompt,
			imageType: item?.request?.image_type,
			ratio: item?.request?.ratio,
			text: item?.response?.results?.text,
			images: item?.response?.results?.images,
			thumbnails: item?.response?.results?.images?.map( ( image ) => {
				return {
					...image,
					image_url: getImageThumbnailURL( meta.thumbnailUrl, image.image_url ),
				};
			} ),
		};
	} );
};

const usePromptHistory = ( historyType ) => {
	const [ isLoading, setIsLoading ] = useState( false );
	const [ data, setData ] = useState( {} );
	const [ error, setError ] = useState( '' );

	const fetchData = async ( { page, limit } ) => new Promise( ( resolve, reject ) => {
		setIsLoading( true );

		getHistory( historyType, page, limit )
			.then( ( response ) => {
				const clone = JSON.parse( JSON.stringify( data ) );

				clone.meta = response.meta;
				clone.items = [ ...clone?.items || [], ...normalizeItems( response ) ];

				setData( clone );

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

		const clone = JSON.parse( JSON.stringify( data ) );

		clone.items.splice( itemIndex, 1 );

		setData( clone );

		return true;
	};

	return {
		isLoading,
		error,
		items: data.items,
		meta: data.meta,
		fetchData,
		deleteItemById,
	};
};

export default usePromptHistory;
