export default class extends elementorModules.Component {
	init( args ) {
		this.title = 'Elements';
		this.namespace = 'panel/elements';

		super.init( args );
	}

	activateTab( tab ) {
		this.parent.setPage( 'elements' );

		this.parent.currentPageView.activateTab( tab );
	}

	getTabs() {
		return {
			categories: elementor.translate( 'elements' ),
			global: elementor.translate( 'global' ),
		};
	}
}
