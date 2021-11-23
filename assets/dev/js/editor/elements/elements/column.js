import Base from './base';

export default class Column extends Base {
	getType() {
		return 'column';
	}

	getView() {
		return require( 'elementor-elements/views/column' );
	}

	getModel() {
		return require( 'elementor-elements/models/column' ).default;
	}
}
