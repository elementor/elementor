export default class AppsLicenseService extends $e.modules.ComponentBase {
	getNamespace() {
		return 'app/services/license';
	}

	isActive() {
		return Promise.resolve( true );
	}

	isExpired() {
		return Promise.resolve( true );
	}

	isValid() {
		return Promise.resolve( true );
	}
}
