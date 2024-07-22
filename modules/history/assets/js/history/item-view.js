export default class extends Marionette.ItemView {
	tagName() {
		return 'button';
	}

	getTemplate() {
		return '#tmpl-elementor-panel-history-item';
	}

	className() {
		return 'elementor-history-item elementor-history-item-' + this.model.get( 'status' );
	}

	triggers() {
		return {
			click: 'click',
		};
	}
}
