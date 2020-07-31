import HookUIBefore from 'elementor-api/modules/hooks/ui/before';

export class RevisionsUpdateCurrent extends HookUIBefore {
	getCommand() {
		return 'panel/history/revisions/preview';
	}

	getId() {
		return 'revisions-update-current--/panel/history/revisions/preview';
	}

	getConditions( args ) {
		const { view } = args;

		return view.model.get( 'id' ).toString() !== elementor.getPanelView().getCurrentPageView().getCurrentTab().currentPreviewId;
	}

	apply( args ) {
		const { view } = args,
			tab = elementor.getPanelView().getCurrentPageView().getCurrentTab();

		if ( tab.currentPreviewItem ) {
			tab.currentPreviewItem.$el.removeClass( 'elementor-revision-current-preview elementor-revision-item-loading' );
		}

		view.$el.addClass( 'elementor-revision-current-preview elementor-revision-item-loading' );
	}
}

export default RevisionsUpdateCurrent;
