import CommandBase from 'elementor-api/modules/command-base';
import RevisionView from '../panel/view';

export class Preview extends CommandBase {
	validateArgs( args = {} ) {
		this.requireArgumentConstructor( 'view', RevisionView, args );
	}

	apply( args ) {
		const { view } = args,
			revisionID = view.model.get( 'id' ),
			tab = elementor.getPanelView().getCurrentPageView().getCurrentTab();

		if ( revisionID === tab.currentPreviewId ) {
			return;
		}

		if ( tab.currentPreviewItem ) {
			tab.currentPreviewItem.$el.removeClass( 'elementor-revision-current-preview elementor-revision-item-loading' );
		}

		view.$el.addClass( 'elementor-revision-current-preview elementor-revision-item-loading' );

		const revision = ( null === tab.currentPreviewId || elementor.config.document.revisions.current_id === tab.currentPreviewId );

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

		tab.currentPreviewItem = view;
		tab.currentPreviewId = revisionID;
	}
}

export default Preview;
