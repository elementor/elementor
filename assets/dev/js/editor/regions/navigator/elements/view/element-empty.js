export default class NavigatorElementEmpty extends Marionette.ItemView {
	getTemplate() {
		return '#tmpl-elementor-navigator__elements--empty';
	}

	className() {
		return 'elementor-empty-view';
	}

	onRendr() { // TODO: Check with mati, Not in use?
		this.$el.css( 'padding-' + ( elementorCommon.config.isRTL ? 'right' : 'left' ), this.getOption( 'indent' ) );
	}
}
