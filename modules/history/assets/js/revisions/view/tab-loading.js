export default class RevisionsTabLoadingView extends Marionette.ItemView {
	getTemplate() {
		return '#tmpl-elementor-panel-revisions-loading';
	}

	id() {
		return 'elementor-panel-revisions-loading';
	}

	onRender() {
		$e.data.get( 'editor/documents/revisions', {
			documentId: this.options.document.id,
		} );
	}
}
