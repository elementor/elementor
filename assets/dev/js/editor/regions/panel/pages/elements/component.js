export default class extends elementorModules.Component {
	init( args ) {
		this.title = 'Elements';
		this.namespace = 'panel/elements';

		super.init( args );
	}

	activateTab( tab ) {
		this.view.setPage( 'elements' );

		this.view.currentPageView.activateTab( tab );
	}

	getTabs() {
		return {
			categories: elementor.translate( 'elements' ),
			global: elementor.translate( 'global' ),
		};
	}
}
