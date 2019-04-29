export default class extends elementorModules.Component {
	getTabsGroups() {
		return {
			settings: {
				general: elementor.translate( 'general' ),
				style: elementor.translate( 'style' ),
				advanced: elementor.translate( 'advanced' ),
			},
		};
	}

	getRoutes() {
		const routes = {};
		_( this.getTabsGroups() ).each( ( group, tabs ) => {
			_( tabs ).each( ( tab ) => {
				routes[ tab ] = () => this.activateTab( tab );
			} );
		} );

		return routes;
	}
}
