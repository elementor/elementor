export class RevisionsSetEditorData extends $e.modules.hookData.After {
	getCommand() {
		return 'editor/documents/revisions';
	}

	getId() {
		return 'revisions-set-editor-data--/editor/documents/revisions';
	}

	getConditions( args ) {
		return ! args.options?.refresh && 'get' === args.options.type && args.query?.revisionId;
	}

	async apply( args, result ) {
		const component = $e.components.get( 'panel/history/revisions' ),
			command = this.getCommand(),
			document = component.currentDocument;

		let resultData = result.data;

		if ( ! resultData.data ) {
			const query = {
				documentId: document.id,
				revisionId: args.query.revisionId,
			};

			// Delete the cache for fresh data, since cache mechanism does not store requests with `options.refresh`.
			$e.data.deleteCache( $e.components.get( 'editor/documents' ), command, query );

			const freshResult = await $e.data.get( command, query, {
				callbacks: {
					'revisions-set-editor-data--/editor/documents/revisions': false,
					'revisions-enter-review-mode--/editor/documents/revisions': false,
				},
			} );

			resultData = freshResult.data;
		}

		if ( document.config.panel.has_elements ) {
			document.revisions.setEditorData( resultData.data.elements );
		}

		elementor.settings.page.model.set( resultData.data.settings );
	}
}

export default RevisionsSetEditorData;
