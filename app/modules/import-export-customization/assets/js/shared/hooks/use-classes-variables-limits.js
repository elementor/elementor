import { useState, useEffect, useCallback } from 'react';

const CLASSES_LIMIT = 100;
const VARIABLES_LIMIT = 100;

export function useClassesVariablesLimits( { open, isImport } ) {
	const [ existingClassesCount, setExistingClassesCount ] = useState( 0 );
	const [ existingVariablesCount, setExistingVariablesCount ] = useState( 0 );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ error, setError ] = useState( null );

	const fetchCounts = useCallback( async () => {
		if ( ! open || ! isImport ) {
			return;
		}

		setIsLoading( true );
		setError( null );

		try {
			const baseUrl = window.wpApiSettings?.root || '/wp-json/';
			const nonce = window.wpApiSettings?.nonce || '';

			const [ classesResponse, variablesResponse ] = await Promise.all( [
				fetch( `${ baseUrl }elementor/v1/global-classes`, {
					headers: {
						'X-WP-Nonce': nonce,
					},
				} ),
				fetch( `${ baseUrl }elementor/v1/variables/list`, {
					headers: {
						'X-WP-Nonce': nonce,
					},
				} ),
			] );

			if ( classesResponse.ok ) {
				const classesData = await classesResponse.json();
				const classesCount = Object.keys( classesData?.data || {} ).length;
				setExistingClassesCount( classesCount );
			}

			if ( variablesResponse.ok ) {
				const variablesData = await variablesResponse.json();
				const variablesCount = variablesData?.data?.total || 0;
				setExistingVariablesCount( variablesCount );
			}
		} catch ( err ) {
			setError( err );
		} finally {
			setIsLoading( false );
		}
	}, [ open, isImport ] );

	useEffect( () => {
		fetchCounts();
	}, [ fetchCounts ] );

	const calculateLimitInfo = useCallback( ( existingCount, importedCount, limit ) => {
		const totalAfterImport = existingCount + importedCount;
		const isExceeded = totalAfterImport > limit;
		const overLimitCount = isExceeded ? totalAfterImport - limit : 0;

		return {
			isExceeded,
			overLimitCount,
			totalAfterImport,
		};
	}, [] );

	return {
		existingClassesCount,
		existingVariablesCount,
		classesLimit: CLASSES_LIMIT,
		variablesLimit: VARIABLES_LIMIT,
		isLoading,
		error,
		calculateLimitInfo,
	};
}
