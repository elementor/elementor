import Category from './category';

export default class extends Marionette.CollectionView {
	id() {
		return 'elementor-assistant__results';
	}

	getChildView() {
		return Category;
	}

	initialize() {
		this.collection = new Backbone.Collection( Object.values( elementorCommon.assistant.getSettings( 'data' ) ) );
	}
}
