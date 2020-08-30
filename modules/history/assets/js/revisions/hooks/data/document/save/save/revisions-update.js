import HookDataAfter from 'elementor-api/modules/hooks/data/after';

export class RevisionsUpdate extends HookDataAfter {
	getCommand() {
		return 'document/save/save';
	}

	getId() {
		return 'revisions-update--/document/save/save';
	}

	apply( args, result ) {
		const { data } = result,
			revisionsManager = args.document.revisions;

		if ( data.latest_revisions ) {
			revisionsManager.addRevisions( data.latest_revisions );
		}

		revisionsManager.requestRevisions( () => {
			if ( data.revisions_ids ) {
				const revisionsToKeep = revisionsManager.revisions.filter( ( revision ) => {
					return -1 !== data.revisions_ids.indexOf( revision.get( 'id' ) );
				} );

				revisionsManager.revisions.reset( revisionsToKeep );
			}
		} );
	}
}

export default RevisionsUpdate;
