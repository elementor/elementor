import { BaseLoaderHide } from '../base-loader-hide';

export class DefaultValuesResetHideLoader extends BaseLoaderHide {
	getCommand() {
		return 'default-values/reset';
	}

	getId() {
		return 'default-values-reset-hide-loader';
	}
}
