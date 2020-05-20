export default class extends Marionette.ItemView {
	className() {
		return 'elementor-finder__results__item';
	}

	getTemplate() {
		return '#tmpl-elementor-finder__results__item';
	}
}
