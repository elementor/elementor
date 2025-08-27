import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

const fetchTaxonomies = async () => {
	const requestUrl = `${ elementorCommon.config.urls.rest }wp/v2/taxonomies`;

	const response = await fetch( requestUrl, {
		headers: {
			'Content-Type': 'application/json',
			'X-WP-Nonce': window.wpApiSettings?.nonce || '',
		},
	} );

	const result = await response.json();

	if ( ! response.ok ) {
		const errorMessage = result?.data?.message || `HTTP error! with the following code: ${ result?.data?.code }`;
		throw new Error( errorMessage );
	}

	return Object.values( result );
};

export function useTaxonomies( { skipLoading = false, exclude = [] } = {} ) {
	const [ taxonomies, setTaxonomies ] = useState( [] );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ error, setError ] = useState( null );
	const isLoaded = useRef( null );

	const fetchAllTaxonomies = useCallback( async () => {
		if ( isLoaded.current ) {
			return;
		}

		try {
			setIsLoading( true );
			setError( null );

			const data = await fetchTaxonomies();

			setTaxonomies(
				exclude.length
					? data.filter( ( taxonomy ) => ! exclude.includes( taxonomy.slug ) )
					: data,
			);
			isLoaded.current = true;
		} catch ( err ) {
			setError( err.message );
		} finally {
			setIsLoading( false );
		}
	}, [] );

	const refreshTaxonomies = useCallback( () => {
		fetchAllTaxonomies();
	}, [ fetchAllTaxonomies ] );

	const taxonomyOptions = useMemo( () => {
		return taxonomies.map( ( taxonomy ) => ( { value: taxonomy.slug, label: taxonomy.name } ) );
	}, [ taxonomies ] );

	useEffect( () => {
		if ( ! skipLoading ) {
			fetchAllTaxonomies();
		}
	}, [ skipLoading ] );

	return {
		taxonomies,
		isLoading,
		error,
		refreshTaxonomies,
		taxonomyOptions,
		isLoaded: isLoaded.current,
	};
}
