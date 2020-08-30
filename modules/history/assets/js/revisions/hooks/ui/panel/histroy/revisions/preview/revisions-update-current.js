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

		return view.model.get( 'id' ).toString() !== $e.components.get( 'panel/history/revisions' ).currentPreviewId;
	}

	apply( args ) {
		const { view } = args,
			component = $e.components.get( 'panel/history/revisions' );

		if ( component.currentPreviewItem ) {
			component.currentPreviewItem.$el.removeClass( 'elementor-revision-current-preview elementor-revision-item-loading' );
		}

		view.$el.addClass( 'elementor-revision-current-preview elementor-revision-item-loading' );
	}
}

export default RevisionsUpdateCurrent;
