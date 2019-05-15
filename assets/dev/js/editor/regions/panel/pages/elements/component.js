export default class extends elementorModules.Component {
	constructor( ...args ) {
		super( ...args );

		this.title = 'Elements';
		this.namespace = 'panel/elements';
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
