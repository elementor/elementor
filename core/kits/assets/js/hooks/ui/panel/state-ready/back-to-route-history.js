export class KitBackToRouteHistory extends $e.modules.hookUI.After {
	getCommand() {
		return 'editor/documents/open';
	}

	getId() {
		return 'back-to-route-history--/editor/documents/open';
	}

	getConditions( args ) {
		return $e.routes.temp && 'kit' !== elementor.documents.get( args.id ).config.type;
	}

	apply( args ) {
		const historyBeforeOpen = $e.routes.temp;

		delete $e.routes.temp;

		setTimeout( () => {
			$e.run( 'panel/editor/open', {
				view: historyBeforeOpen.container.view,
				model: historyBeforeOpen.container.model,
			} );

			$e.route( historyBeforeOpen.route );
		} );
	}
}

export default KitBackToRouteHistory;
