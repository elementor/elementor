import { useState, useEffect } from 'react';

export const KEY = 'cloud-kits-availability';

/**
 * Fetch cloud kits availability from WordPress backend
 *
 * @return {Promise<boolean>} Whether cloud kits should be available
 */
async function fetchCloudKitsEligibility() {
	const isCloudKitsExperimentActive = elementorCommon?.config?.experimentalFeatures?.e_cloud_library_kits;
	if ( ! isCloudKitsExperimentActive ) {
		return false;
	}

	try {
		const response = await $e.data.get( 'kits-cloud/eligibility', {}, { refresh: true } );
		return response?.data?.data?.threshold >= 1;
	} catch ( error ) {
		return false;
	}
}

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
