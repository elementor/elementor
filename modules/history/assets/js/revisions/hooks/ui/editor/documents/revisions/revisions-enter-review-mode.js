export class RevisionsEnterReviewMode extends $e.modules.hookUI.After {
	getCommand() {
		return 'editor/documents/revisions';
	}

	getId() {
		return 'revisions-enter-review-mode--/editor/documents/revisions';
	}

	getConditions( args ) {
		return 'get' === args.options.type && args.query?.revisionId;
	}

	apply() {
		const component = $e.components.get( 'panel/history/revisions' );

		component.tab.setRevisionsButtonsActive( true );

		component.tab.enterReviewMode();
	}
}

export default RevisionsEnterReviewMode;
