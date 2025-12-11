import { getLicenseInfo } from '../sync/license-info';

declare global {
	interface Window {
		ElementorVariablesQuotaConfig: Record< string, number >;
	}
}

export const useQuotaPermissions = ( variableType: string ) => {
	const quotaConfig = window.ElementorVariablesQuotaConfig || {};
	const limit = quotaConfig[ variableType ] || 0;
	const hasQuota = limit > 0;

	return {
		canAdd: () => ! hasQuota && ! getLicenseInfo().hasPro,
		canEdit: () => ! hasQuota && ! getLicenseInfo().hasPro,
	};
};
