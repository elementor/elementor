export default class extends Marionette.ItemView {
	getTemplate() {
		return '#tmpl-elementor-panel-elements-category-empty';
	}

	className() {
		return 'elementor-panel-category-items-empty';
	}
}
