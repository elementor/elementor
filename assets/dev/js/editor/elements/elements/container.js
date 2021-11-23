import Base from './base';

export default class Container extends Base {
	getType() {
		return 'container';
	}

	getView() {
		return require( 'elementor-elements/views/container' );
	}

	getEmptyView() {
		return require( 'elementor-elements/views/container/empty-component' ).default;
	}

	getModel() {
		return require( 'elementor-elements/models/container' ).default;
	}
}
