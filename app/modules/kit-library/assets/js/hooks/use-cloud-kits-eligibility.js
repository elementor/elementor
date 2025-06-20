import { useQuery } from 'react-query';
import { fetchCloudKitsEligibility } from 'elementor-app/utils/cloud-kits.js';

export const KEY = 'cloud-kits-availability';

/**
 * Hook to check if cloud kits should be available
 *
 * @param {Object} options - React Query options
 * @return {Object} Query result with availability status
 */
export default function useCloudKitsEligibility( options = {} ) {
	return useQuery(
		[ KEY ],
		fetchCloudKitsEligibility,
		options,
	);
}
