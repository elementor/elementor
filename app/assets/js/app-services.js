import AppAccountService from 'elementor/app/services/account/account-service';
import AppConfigService from 'elementor/app/services/config/config-service';
import AppLicenseService from 'elementor/app/services/license/license-service';

class Services {
	accountService = new AppAccountService();
	configService = new AppConfigService();
	licenseService = new AppLicenseService();
}

const services = new Services();

window.elementorAppServices = {
	...services,
};
