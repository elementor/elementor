import { BaseLoaderShow } from '../base-loader-show';

export class DefaultValuesCreateShowLoader extends BaseLoaderShow {
	getCommand() {
		return 'default-values/create';
	}

	getId() {
		return 'default-values-create-show-loader';
	}
}
