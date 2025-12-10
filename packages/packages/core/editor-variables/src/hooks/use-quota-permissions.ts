import { useVariableType } from '../context/variable-type-context';
import { getLicenseInfo } from '../sync/license-info';

export const useQuotaPermissions = () => {
	const licenseInfo = getLicenseInfo();
	const { isForPro } = useVariableType();

	return {
		canAdd: () => ! isForPro || licenseInfo.hasPro,
		canEdit: () => ! isForPro || licenseInfo.hasPro,
	};
};
