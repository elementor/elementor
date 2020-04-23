export default class extends Marionette.LayoutView {
	id() {
		return 'elementor-kit-panel-menu';
	}

	getTemplate() {
		return '#tmpl-elementor-kit-panel-menu';
	}

	ui() {
		return {
			menuItems: '.elementor-panel-menu-item',
		};
	}

	events() {
		return {
			'click @ui.menuItems': 'onClickMenuItem',
		};
	}

	onClickMenuItem( event ) {
		const tab = jQuery( event.currentTarget ).data( 'tab' );
		$e.route( `panel/global/${ tab }` );
	}

	onBeforeShow() {
		$e.run( 'panel/global/open' );
	}
}
