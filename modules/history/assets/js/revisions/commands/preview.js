import CommandBase from 'elementor-api/modules/command-base';
import RevisionView from '../panel/view';

/**
 * @property {RevisionsComponent} component
 */
export class Preview extends CommandBase {
	validateArgs( args = {} ) {
		this.requireArgumentConstructor( 'view', RevisionView, args );
	}

	apply( args ) {
		const { view } = args,
			revisionID = view.model.get( 'id' ),
			tab = elementor.getPanelView().getCurrentPageView().getCurrentTab();

		if ( revisionID === this.component.currentPreviewId ) {
			return;
		}

		const revision = ( null === this.component.currentPreviewId ||
			elementor.config.document.revisions.current_id === this.component.currentPreviewId );

		if ( revision && elementor.saver.isEditorChanged() ) {
			// TODO: Change to 'document/save/auto' ?.
			$e.internal( 'document/save/save', {
				status: 'autosave',
				onSuccess: () => {
					tab.getRevisionViewData( view );
				},
			} );
		} else {
			tab.getRevisionViewData( view );
		}

		this.component.currentPreviewItem = view;
		this.component.currentPreviewId = revisionID;
	}
}

export default Preview;
