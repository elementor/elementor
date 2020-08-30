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
				revisionID = view.model.get( 'id' );

			if ( revisionID === this.component.currentPreviewId ) {
				reject( `Revision with id: '${ revisionID }' is already in preview` );
				return false;
			}

			this.component.getRevisionViewData( view, resolve );

			this.component.currentPreviewItem = view;
			this.component.currentPreviewId = revisionID;

			return true;
		} );
	}
}

export default Preview;
