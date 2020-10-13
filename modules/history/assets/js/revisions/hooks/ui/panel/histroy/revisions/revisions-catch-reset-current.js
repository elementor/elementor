export class RevisionsCatchResetCurrent extends $e.modules.hookUI.Catch {
	getCommand() {
		return 'panel/history/revisions';
	}

	getId() {
		return 'revisions-catch-reset-current--/panel/history/revisions';
	}

	getConditions( args, result ) {
		return 'get' === args.options.type && args.query?.revisionId && 404 === result.data?.status;
	}

	apply( args, result ) {
		const component = $e.components.get( 'panel/history/revisions' );

		elementor.notifications.showToast( { message: result.message } );

		component.currentPreviewItem = null;
		component.currentPreviewId = null;
	}
}

export default RevisionsCatchResetCurrent;
