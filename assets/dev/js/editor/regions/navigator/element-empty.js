export default class extends Marionette.ItemView {
	getTemplate() {
		return '#tmpl-elementor-navigator__elements--empty';
	}

	className() {
		return 'elementor-empty-view';
	}

	onRendr() {
		this.$el.css( 'padding-' + ( elementor.config.is_rtl ? 'right' : 'left' ), this.getOption( 'indent' ) );
	}
}
