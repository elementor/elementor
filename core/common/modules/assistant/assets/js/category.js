import ItemView from './item';
import ItemModel from './item-model';

export default class extends Marionette.CompositeView {
	className() {
		return 'elementor-assistant__results__category';
	}

	getTemplate() {
		return '#tmpl-elementor-assistant__results__category';
	}

	getChildView() {
		return ItemView;
	}

	initialize() {
		this.childViewContainer = '.elementor-assistant__results__category__items';

		this.collection = new Backbone.Collection( this.model.get( 'items' ), { model: ItemModel } );
	}

	filter( childModel ) {
		const filterValue = elementorCommon.assistant.channel.request( 'filter:text' ).trim().toLowerCase();

		return childModel.get( 'title' ).toLowerCase().indexOf( filterValue ) >= 0;
	}

	onRender() {
		this.listenTo( elementorCommon.assistant.channel, 'filter:change', this._renderChildren.bind( this ) );
	}

	onRenderCollection() {
		this.$el.toggle( ! ! this.children.length );
	}
}
