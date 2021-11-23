import Base from './base.js';

export default class Document extends Base {
	getType() {
		return 'document';
	}

	getModel() {
		return require( 'elementor-elements/models/document' ).default;
	}
}
