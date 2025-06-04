/**
 * Fetch cloud kits availability from WordPress backend
 *
 * @return {Promise<boolean>} Whether cloud kits should be available
 */
export async function fetchCloudKitsEligibility() {
	const isCloudKitsExperimentActive = elementorCommon?.config?.experimentalFeatures?.e_cloud_library_kits;
	if ( ! isCloudKitsExperimentActive ) {
		return false;
	}

	const response = await $e.data.get( 'kits-cloud/eligibility', {}, { refresh: true } );

	return response?.data;
} 