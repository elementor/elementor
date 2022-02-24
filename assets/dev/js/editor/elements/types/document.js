import Base from '../types/base/element-base';
import Model from 'elementor-elements/models/document';

export default class Document extends Base {
	getType() {
		return 'document';
	}

	getModel() {
		return Model;
	}
}
