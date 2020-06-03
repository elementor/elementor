export default class extends Marionette.ItemView {
	getTemplate() {
		return '#tmpl-elementor-panel-history-no-items';
	}

	id() {
		return 'elementor-panel-history-no-items';
	}

	onDestroy() {
		this._parent.$el.removeClass( 'elementor-empty' );
	}
}
