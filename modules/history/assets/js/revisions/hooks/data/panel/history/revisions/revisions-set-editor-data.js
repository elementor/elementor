export class RevisionsSetEditorData extends $e.modules.hookData.After {
	getCommand() {
		return 'editor/documents/revisions';
	}

	getId() {
		return 'revisions-set-editor-data--/panel/history/revisions';
	}

	getConditions( args ) {
		return 'get' === args.options.type && args.query?.revisionId;
	}

	async apply( args, result ) {
		const component = $e.components.get( 'panel/history/revisions' ),
			document = component.currentDocument,
			data = result.data;

		if ( ! data.editor ) {
			result = await $e.data.get( 'editor/documents/revisions-data', {
				documentId: document.id,
				revisionId: args.query.revisionId,
			} );

			data.editor = result.data;
		}

		if ( document.config.panel.has_elements ) {
			document.revisions.setEditorData( data.editor.elements );
		}

		elementor.settings.page.model.set( data.editor.settings );
	}
}

export default RevisionsSetEditorData;
