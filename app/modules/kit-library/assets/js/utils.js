/**
 * A util function to transform data throw transform functions
 *
 * @param {Array<Function>} functions
 * @return {function(*=, ...[*]): *} function
 */
export function pipe( ...functions ) {
	return ( value, ...args ) =>
		functions.reduce(
			( currentValue, currentFunction ) => currentFunction( currentValue, ...args ),
			value,
		);
}

/**
 * Check if cloud kits are deactivated based on storage quota
 *
 * @param {Object} quotaData - The quota data from the API
 * @return {boolean} True if deactivated, false otherwise
 */
export function isCloudKitsDeactivated( quotaData ) {
	if ( ! quotaData?.storage ) {
		return false;
	}

	const {
		currentUsage = 0,
		subscriptionId = '',
	} = quotaData.storage;

	const hasStorageUsage = currentUsage > 0;
	const hasNoSubscription = '' === subscriptionId;

	return hasStorageUsage && hasNoSubscription;
}
