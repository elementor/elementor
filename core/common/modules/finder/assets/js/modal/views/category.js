import ItemView from './item';
import ItemModel from '../model/item';

export default class extends Marionette.CompositeView {
	className() {
		return 'elementor-finder__results__category';
	}

	getTemplate() {
		return '#tmpl-elementor-finder__results__category';
	}

	getChildView() {
		return ItemView;
	}

	initialize() {
		this.childViewContainer = '.elementor-finder__results__category__items';

		this.isVisible = true;

		let items = this.model.get( 'items' );

		if ( items ) {
			items = Object.values( items );
		}

		this.collection = new Backbone.Collection( items, { model: ItemModel } );
	}

	filter( childModel ) {
		const textFilter = this.getTextFilter();

		if ( childModel.get( 'title' ).toLowerCase().indexOf( textFilter ) >= 0 ) {
			return true;
		}

		return childModel.get( 'keywords' ).some( ( keyword ) => keyword.indexOf( textFilter ) >= 0 );
	}

	getTextFilter() {
		return elementorCommon.finder.channel.request( 'filter:text' ).trim().toLowerCase();
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
		this.listenTo( elementorCommon.finder.channel, 'filter:change', this.onFilterChange.bind( this ) );
	}

	onFilterChange() {
		this._renderChildren();
	}

	onRenderCollection() {
		this.toggleElement();
	}
}
