import CommandBase from 'elementor-api/modules/command-base';
import RevisionsTabItemView from '../view/tab-item';

/**
 * @property {RevisionsComponent} component
 */
export class Preview extends CommandBase {
	validateArgs( args = {} ) {
		this.requireArgumentConstructor( 'view', RevisionsTabItemView, args );
	}

	apply( args ) {
		return new Promise( ( resolve, reject ) => {
			const { view } = args,
				revisionId = view.model.get( 'id' );

			if ( revisionId === this.component.currentPreviewId ) {
				reject( `Revision with id: '${ revisionId }' is already in preview` );
				return false;
			}

			const result = $e.data.get( 'editor/documents/revisions', {
				documentId: this.component.currentDocument.id,
				revisionId,
			} );

			result.catch( reject );

			this.component.currentPreviewItem = view;
			this.component.currentPreviewId = revisionId;

			result.then( resolve );
		} );
	}
}

export default Preview;
