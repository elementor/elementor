import { useQuery } from 'react-query';

export const KEY = 'cloud-kits-availability';

/**
 * Fetch cloud kits availability from WordPress backend
 *
 * @return {Promise<boolean>} Whether cloud kits should be available
 */
async function fetchCloudKitsEligibility() {	
	const response = await $e.data.get( 'kits-cloud-eligibility/index', {}, { refresh: true } );
	
	const isCloudKitsExperimentActive = elementorCommon?.config?.experimentalFeatures?.e_cloud_library_kits;

	return ( response?.data?.data?.threshold >= 1 && isCloudKitsExperimentActive ) || false;
}

/**
 * Hook to check if cloud kits should be available
 *
 * @return {Object} Query result with availability status
 */
export default function useCloudKitsEligibility() {
	return useQuery( 
		[ KEY ], 
		fetchCloudKitsEligibility,
	);
}
