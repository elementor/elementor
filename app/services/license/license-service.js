export default class AppsLicenseService extends $e.modules.ComponentBase {
	getNamespace() {
		return 'apps/license';
	}

	isActive() {
		return false;
	}

	isExpired() {
		return false;
	}
}
