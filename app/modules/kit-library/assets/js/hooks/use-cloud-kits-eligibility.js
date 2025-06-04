import { useQuery } from 'react-query';
import { fetchCloudKitsEligibility } from 'elementor-app/utils/cloud-kits.js';

export const KEY = 'cloud-kits-availability';

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
