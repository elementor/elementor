export const useQuotaPermissions = ( variableType: string ) => {
	const limit = window.ElementorVariablesQuotaConfig?.[ variableType ] ?? 0;
	const hasQuota = limit > 0;

	return {
		canAdd: () => hasQuota,
		canEdit: () => hasQuota,
	};
};