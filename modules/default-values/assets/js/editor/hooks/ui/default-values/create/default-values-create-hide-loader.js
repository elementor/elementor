import { BaseLoaderHide } from '../base-loader-hide';

export class DefaultValuesCreateHideLoader extends BaseLoaderHide {
	getCommand() {
		return 'default-values/create';
	}

	getId() {
		return 'default-values-create-hide-loader';
	}
}
