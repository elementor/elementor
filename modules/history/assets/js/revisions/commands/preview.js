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
				revisionID = view.model.get( 'id' ),
				tab = elementor.getPanelView().getCurrentPageView().getCurrentTab();

			if ( revisionID === this.component.currentPreviewId ) {
				reject( `Revision with id: '${ revisionID }' is already in preview` );
			}

			tab.getRevisionViewData( view, resolve );

			this.component.currentPreviewItem = view;
			this.component.currentPreviewId = revisionID;
		} );
	}
}

export default Preview;
