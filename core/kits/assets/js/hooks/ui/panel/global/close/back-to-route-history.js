import BaseOpenClose from '../base/base-open-close';

export class KitBackToRouteHistory extends BaseOpenClose {
	getCommand() {
		return 'panel/global/close';
	}

	getId() {
		return 'back-to-route-history-/panel/global/close';
	}

	getConditions() {
		return this.component.routeHistory;
	}

	apply() {
		const historyBeforeOpen = this.component.routeHistory;

		delete this.component.routeHistory;

		/**
		 * TODO: Find better solution.
		 * Since cache deleted after leaving globals.
		 * Cover issue: When back to route, it back to style, it causes the UI ask for styles separately and since,
		 * Cache deleted, it asks the remote ( $e.data ) for specific colors/typography endpoints and causes a delay in global select box.
		 * To handle the the issue, request globals manually, then back to route.
		 */
		if ( historyBeforeOpen.container ) {
			$e.data.get( 'globals/index' ).then( () => {
				// Since the container comes from history, its not connected element.
				historyBeforeOpen.container = historyBeforeOpen.container.lookup();
				historyBeforeOpen.container.model.trigger( 'request:edit', { scrollIntoView: true } );

				$e.route( historyBeforeOpen.route, {
					model: historyBeforeOpen.container.model,
					view: historyBeforeOpen.container.view,
				} );
			} );
		}
	}
}

export default KitBackToRouteHistory;
