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

		/**
		 * TODO: Find better solution.
		 * Since cache deleted after leaving globals.
		 * Cover issue: When back to route, it back to style, it causes the UI ask for styles separately and since,
		 * Cache deleted, it asks the remote ( $e.data ) for specific colors/typography endpoints and causes a delay in global select box.
		 * To handle the the issue, request globals manually, then back to route.
		 */
		$e.data.get( 'globals/index' ).then( () => {
			// Since the container comes from history, its not connected element.
			historyBeforeOpen.container = historyBeforeOpen.container.lookup();

			$e.run( 'panel/editor/open', {
				view: historyBeforeOpen.container.view,
				model: historyBeforeOpen.container.model,
			} );

			$e.route( historyBeforeOpen.route );
		} );
	}
}

export default KitBackToRouteHistory;
