import RevisionsCollection from '../../../../../collection';

export class RevisionsSetCollection extends $e.modules.hookData.After {
	getCommand() {
		return 'editor/documents/revisions';
	}

	getId() {
		return 'revisions-set-collection--/panel/history/revisions';
	}

	getConditions( args ) {
		return 'get' === args.options.type && ! args.query?.revisionId;
	}

	apply( args, result ) {
		const document = elementor.documents.getCurrent();

		document.revisions.revisions = new RevisionsCollection( Object.values( result.data ) );

		document.revisions.revisions.on( 'update', () => {
			if ( $e.routes.is( 'panel/history/revisions' ) ) {
				$e.routes.refreshContainer( 'panel' );
			}
		} );

		setTimeout( () => {
			$e.routes.refreshContainer( 'panel' );
		} );
	}
}

export default RevisionsSetCollection;
