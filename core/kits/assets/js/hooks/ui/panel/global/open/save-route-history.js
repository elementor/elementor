export class KitSaveRouteHistory extends $e.modules.hookUI.Before {
	getCommand() {
		return 'panel/global/open';
	}

	getId() {
		return 'save-route-history--/panel/global/open';
	}

	getConditions( args = {}, result ) {
		return args.route && args.container;
	}

	apply( args ) {
		// TODO: Save reference in memory.
		// $e.data.setTemp( $e.components.get( 'panel/global' ),  'routeHistory', args );
		// or $e.data.setTempOnce - means when you get it, it will automatically remove.
		$e.routes.temp = args;
	}
}

export default KitSaveRouteHistory;
