export default class extends Marionette.ItemView {
	getTemplate() {
		return '#tmpl-elementor-panel-revisions-loading';
	}

	id() {
		return 'elementor-panel-revisions-loading';
	}

	onRender() {
		elementor.history.revisions.requestRevisions( () => {
			setTimeout( () => elementorCommon.route.to( 'panel/history/revisions' ) );
		} );
	}
}
