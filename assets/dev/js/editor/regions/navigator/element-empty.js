export default class extends Marionette.ItemView {
	getTemplate() {
		return '#tmpl-elementor-navigator__elements--empty';
	}

	className() {
		return 'elementor-empty-view';
	}

	onRender() {
		this.$el.css( 'padding-inline-start', this.getOption( 'indent' ) + 'px' );
	}
}
