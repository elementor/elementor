import Base from './base';

export default class Widget extends Base {
	getType() {
		return 'widget';
	}

	getView() {
		return require( 'elementor-elements/views/widget' );
	}

	getModel() {
		return require( 'elementor-elements/models/widget' ).default;
	}
}
