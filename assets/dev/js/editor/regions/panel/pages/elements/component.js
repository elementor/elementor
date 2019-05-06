export default class extends elementorModules.Component {
	init( args ) {
		this.title = 'Elements';
		this.namespace = 'panel/elements';

		super.init( args );
	}

	getTabsWrapperSelector() {
		return '#elementor-panel-elements-navigation';
	}

	activateTab( tab ) {
		this.parent.setPage( 'elements' );

		this.parent.getCurrentPageView().showView( tab );

		super.activateTab( tab );
	}

	getTabs() {
		return {
			categories: elementor.translate( 'elements' ),
			global: elementor.translate( 'global' ),
		};
	}
}
