import Category from './category';

export default class extends Category {
	ui() {
		return {
			title: '.elementor-assistant__results__category__title',
		};
	}

	fetchData() {
		elementorCommon.ajax.addRequest( 'assistant_get_category_data', {
			data: {
				category: this.model.get( 'name' ),
				filter: this.getTextFilter(),
			},
			success: ( data ) => {
				this.collection.set( data );

				this.toggleElement();
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

		this.fetchData();
	}
}
