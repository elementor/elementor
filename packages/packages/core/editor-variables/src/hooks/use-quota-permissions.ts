export const useQuotaPermissions = ( variableType: string ) => {
	const quotaConfig = {
		...( window.ElementorVariablesQuotaConfig || {} ),
		...( window.ElementorVariablesQuotaConfigExtended || {} ),
	};

	// BC: Remove when 4.01 is released
	const hasLegacySupport = quotaConfig[ variableType ] === undefined && window.elementorPro;

	const limit = quotaConfig[ variableType ] || 0;
	const hasPermission = hasLegacySupport || limit > 0;

	return {
		canAdd: () => hasPermission,
		canEdit: () => hasPermission,
	};
};
