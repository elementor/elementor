import Base from './base.js';
import Model from 'elementor-elements/models/document';

export default class Document extends Base {
	getType() {
		return 'document';
	}

	getModel() {
		return Model;
	}
}
