import AppAccountService from 'elementor/app/services/account/account-service';
import AppLicenseService from 'elementor/app/services/license/license-service';

class Services {
	accountService = new AppAccountService();
	licenseService = new AppLicenseService();
}

const services = new Services();

window.elementorAppServices = {
	...services,
};
