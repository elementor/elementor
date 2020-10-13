import HookDataAfter from 'elementor-api/modules/hooks/data/after';

export class RevisionsUpdateCollection extends HookDataAfter {
	getCommand() {
		return 'document/save/save';
	}

	getId() {
		return 'revisions-update--/document/save/save';
	}

	apply( args, result ) {
		const { data } = result,
			document = args.document,
			revisionsManager = document.revisions,
			query = { documentId: document.id },
			options = { refresh: true };

		if ( data.latest_revisions ) {
			this.addRevisions( document, data.latest_revisions );
		}

		$e.data.get( 'editor/documents/revisions', query, options ).then( () => {
			if ( data.revisions_ids ) {
				const revisionsToKeep = revisionsManager.revisions.filter( ( revision ) => {
					return -1 !== data.revisions_ids.indexOf( revision.get( 'id' ) );
				} );

				revisionsManager.revisions.reset( revisionsToKeep );
			}

			$e.data.deleteCache(
				$e.components.get( 'editor/documents' ),
				'editor/documents/revisions',
				query
			);
		} );
	}

	addRevisions( document, revisions ) {
		const collection = document.revisions.revisions;

		revisions.forEach( ( revision ) => {
			const existedModel = collection.findWhere( {
				id: revision.id,
			} );

			if ( existedModel ) {
				collection.remove( existedModel, { silent: true } );
			}

			collection.add( revision, { silent: true } );
		} );

		collection.trigger( 'update' );
	}
}

export default RevisionsUpdateCollection;
