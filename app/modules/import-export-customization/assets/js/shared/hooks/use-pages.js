import { useState, useEffect, useCallback, useMemo } from 'react';

export function usePages( { skipLoading = false } = {} ) {
	const [ pages, setPages ] = useState( [] );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ error, setError ] = useState( null );
	const [ hasMorePages, setHasMorePages ] = useState( true );

	const fetchAllPages = useCallback( async () => {
		try {
			setIsLoading( true );
			setError( null );
			setPages( [] );
			setHasMorePages( true );

			let currentPage = 1;
			let allPages = [];

			while ( hasMorePages || 1 === currentPage ) {
				const requestUrl = `${ elementorCommon.config.urls.rest }wp/v2/pages?page=${ currentPage }&per_page=100&_embed`;

				const response = await fetch( requestUrl, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						'X-WP-Nonce': window.wpApiSettings?.nonce || '',
					},
				} );

				if ( ! response.ok ) {
					throw new Error( `HTTP error! status: ${ response.status }` );
				}

				const data = await response.json();
				const totalPages = parseInt( response.headers.get( 'X-WP-TotalPages' ) || '1' );

				allPages = [ ...allPages, ...data ];

				if ( totalPages <= currentPage ) {
					setHasMorePages( false );
					break;
				}

				currentPage++;
			}

			setPages( allPages );
		} catch ( err ) {
			setError( err.message );
		} finally {
			setIsLoading( false );
		}
	}, [ hasMorePages ] );

	const refreshPages = useCallback( () => {
		fetchAllPages();
	}, [ fetchAllPages ] );

	const pageOptions = useMemo( () => {
		return pages.map( ( page ) => ( { value: page.id, label: page.title.rendered } ) );
	}, [ pages ] );

	useEffect( () => {
		if ( ! skipLoading ) {
			fetchAllPages();
		}
	}, [ skipLoading ] );

	return {
		pages,
		isLoading,
		error,
		refreshPages,
		pageOptions,
	};
}
