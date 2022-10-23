export default class AppsLicenseService extends $e.modules.ComponentBase {
	getNamespace() {
		return 'app/services/license';
	}

	isActive() {
		return Promise.resolve( false );
	}

	isExpired() {
		return Promise.resolve( false );
	}

	isValid() {
		return Promise.resolve( false );
	}
}
