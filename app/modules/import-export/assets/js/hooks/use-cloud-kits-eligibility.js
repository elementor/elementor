import { useState, useEffect } from 'react';
import { fetchCloudKitsEligibility } from 'elementor-app/utils/cloud-kits.js';

/**
 * Hook to check if cloud kits should be available
 *
 * @return {Object} Query result with availability status
 */
export default function useCloudKitsEligibility() {
	const [ data, setData ] = useState( false );
	const [ isLoading, setIsLoading ] = useState( true );
	const [ error, setError ] = useState( null );

	useEffect( () => {
		let isMounted = true;

		const checkEligibility = async () => {
			setIsLoading( true );
			setError( null );

			try {
				const result = await fetchCloudKitsEligibility();
				if ( isMounted ) {
					setData( result );
				}
			} catch ( err ) {
				if ( isMounted ) {
					setError( err );
					setData( false );
				}
			} finally {
				if ( isMounted ) {
					setIsLoading( false );
				}
			}
		};

		checkEligibility();

		return () => {
			isMounted = false;
		};
	}, [] );

	return {
		data,
		isLoading,
		error,
	};
}
