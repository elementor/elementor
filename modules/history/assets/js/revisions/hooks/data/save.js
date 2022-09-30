import HookDataAfter from 'elementor-api/modules/hooks/data/after';

export class RevisionsAfterSave extends HookDataAfter {
	getCommand() {
		return 'document/save/save';
	}

	getId() {
		return 'revisions-after-save';
	}

	apply( args, result ) {
		const { data } = result,
			revisionsModule = elementor.documents.getCurrent().revisions;

		if ( data.latest_revisions ) {
			revisionsModule.addRevisions( data.latest_revisions );
		}

		revisionsModule.requestRevisions( () => {
			if ( data.revisions_ids ) {
				const revisionsToKeep = revisionsModule.revisions.filter( ( revision ) => {
					return -1 !== data.revisions_ids.indexOf( revision.get( 'id' ) );
				} );

				revisionsModule.revisions.reset( revisionsToKeep );
			}
		} );
	}
}

export default RevisionsAfterSave;
