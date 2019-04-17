export default class extends elementorModules.Component {
	getTabsGroups() {
		return {
			settings: {
				tabs: {
					general: elementor.translate( 'general' ),
					style: elementor.translate( 'style' ),
					advanced: elementor.translate( 'advanced' ),
				},
			},
		};
	}

	getRoutes() {
		const routes = {};
		_( this.getTabsGroups() ).each( ( group, args ) => {
			_( args.tabs ).each( ( tab ) => {
				routes[ tab ] = () => this.activateTab( tab );
			} );
		} );

		return routes;
	}
}
