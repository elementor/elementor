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

		this.isVisible = true;

		this.collection = new Backbone.Collection( this.model.get( 'items' ), { model: ItemModel } );
	}

	filter( childModel ) {
		return childModel.get( 'title' ).toLowerCase().indexOf( this.getTextFilter() ) >= 0;
	}

	getTextFilter() {
		return elementorCommon.assistant.channel.request( 'filter:text' ).trim().toLowerCase();
	}

	toggleElement() {
		const isCurrentlyVisible = ! ! this.children.length;

		if ( isCurrentlyVisible !== this.isVisible ) {
			this.isVisible = isCurrentlyVisible;

			this.$el.toggle( isCurrentlyVisible );

			this.triggerMethod( 'toggle:visibility' );
		}
	}

	onRender() {
		this.listenTo( elementorCommon.assistant.channel, 'filter:change', this.onFilterChange.bind( this ) );
	}

	onFilterChange() {
		this._renderChildren();
	}

	onRenderCollection() {
		this.toggleElement();
	}
}
