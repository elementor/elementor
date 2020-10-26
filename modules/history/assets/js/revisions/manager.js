/**
 * TODO: Remove 'RevisionsManager'.
 */
export default class RevisionsManager {
	document;
	revisions;

	constructor( document ) {
		this.document = document;
	}

	getItems() {
		return this.revisions;
	}

	setEditorData( data ) {
		const collection = elementor.getPreviewView().collection;

		collection.reset( data );
	}

	deleteRevision( revisionModel, options ) {
		const params = {
			data: {
				id: revisionModel.get( 'id' ),
			},
			success: () => {
				if ( options.success ) {
					options.success();
				}

				revisionModel.destroy();
			},
		};

		if ( options.error ) {
			params.error = options.error;
		}

		elementorCommon.ajax.addRequest( 'delete_revision', params );
	}
}
