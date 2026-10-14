import { useQuery } from 'react-query';
import { fetchCloudKitsQuota } from '../utils/cloud-kits.js';

export const KEY = 'cloud-kits-quota';

/**
 * Hook to fetch cloud kits quota data
 *
 * @param {Object} options - React Query options
 * @return {Object} Query result with quota data
 */
export default function useCloudKitsQuota( options = {} ) {
	return useQuery(
		[ KEY ],
		fetchCloudKitsQuota,
		options,
	);
}
