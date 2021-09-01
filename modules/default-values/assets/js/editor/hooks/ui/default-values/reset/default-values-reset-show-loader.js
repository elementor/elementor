import { BaseLoaderShow } from '../base-loader-show';

export class DefaultValuesResetShowLoader extends BaseLoaderShow {
	getCommand() {
		return 'default-values/reset';
	}

	getId() {
		return 'default-values-reset-show-loader';
	}
}
