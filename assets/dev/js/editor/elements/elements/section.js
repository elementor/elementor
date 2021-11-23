import Base from './base';

export default class Section extends Base {
	getType() {
		return 'section';
	}

	getView() {
		return require( 'elementor-elements/views/section' );
	}

	getModel() {
		return require( 'elementor-elements/models/section' ).default;
	}
}
