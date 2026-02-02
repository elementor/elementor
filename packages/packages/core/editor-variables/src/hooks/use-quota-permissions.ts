export const useQuotaPermissions = ( variableType: string ) => {
	const quotaConfig = window.ElementorVariablesQuotaConfig;
	const limit = quotaConfig?.[ variableType ] || 0;
	const hasQuota = limit > 0;

	return {
		canAdd: () => ( quotaConfig ? hasQuota : true ),
		canEdit: () => ( quotaConfig ? hasQuota : true ),
	};
};
