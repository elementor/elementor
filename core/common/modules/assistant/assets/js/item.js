export default class extends Marionette.ItemView {
	className() {
		return 'elementor-assistant__results__item';
	}

	getTemplate() {
		return '#tmpl-elementor-assistant__results__item';
	}
}
