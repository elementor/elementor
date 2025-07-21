import { useState, useEffect, useCallback, useMemo } from 'react';

const fetchTaxonomies = async () => {
	const baseUrl = elementorAppConfig[ 'import-export-customization' ].restApiBaseUrl;

	const response = await fetch( `${ baseUrl }/taxonomies`, {
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

	return result.data;
};

export function useTaxonomies( { skipLoading = false } = {} ) {
	const [ taxonomies, setTaxonomies ] = useState( [] );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ error, setError ] = useState( null );

	const fetchAllTaxonomies = useCallback( async () => {
		try {
			setIsLoading( true );
			setError( null );

			const data = await fetchTaxonomies();
			setTaxonomies( data );
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
		return taxonomies.map( ( taxonomy ) => ( { value: taxonomy.name, label: taxonomy.label } ) );
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
	};
}
