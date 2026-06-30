/**
 * Fetch cloud kits availability from WordPress backend
 *
 * @return {Promise<boolean>} Whether cloud kits should be available
 */
export async function fetchCloudKitsEligibility() {
	const response = await $e.data.get( 'cloud-kits/eligibility', {}, { refresh: true } );

	return response?.data;
}

/**
 * Fetch cloud kits quota from WordPress backend
 *
 * @return {Promise<Object>} Quota data including storage information
 */
export async function fetchCloudKitsQuota() {
	const response = await $e.data.get( 'cloud-kits/quota', {}, { refresh: true } );

	return response?.data;
}
