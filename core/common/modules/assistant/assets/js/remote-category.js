import Category from './category';

export default class extends Category {
	className() {
		return super.className() + ' elementor-assistant__results__category--remote';
	}

	ui() {
		return {
			title: '.elementor-assistant__results__category__title',
		};
	}

	fetchData() {
		this.ui.loadingIcon.show();

		elementorCommon.ajax.addRequest( 'assistant_get_category_data', {
			data: {
				category: this.model.get( 'name' ),
				filter: this.getTextFilter(),
			},
			success: ( data ) => {
				this.collection.set( data );

				this.toggleElement();

				this.ui.loadingIcon.hide();
			},
		} );
	}

	filter() {
		return true;
	}

	onFilterChange() {
		this.fetchData();
	}

	onRender() {
		super.onRender();

		this.ui.loadingIcon = jQuery( '<i>', { class: 'eicon-loading eicon-animation-spin' } );

		this.ui.title.after( this.ui.loadingIcon );

		this.fetchData();
	}
}
