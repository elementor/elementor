import Frontend from 'elementor-frontend/frontend-base';
import config from './frontend-config';

export default class FrontendTest extends Frontend {
	getConfig() {
		return config;
	}
}
