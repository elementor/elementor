import HookUIBefore from 'elementor-api/modules/hooks/ui/before';

export class RevisionsUpdateCurrentBefore extends HookUIBefore {
	getCommand() {
		return 'panel/history/revisions/preview';
	}

	getId() {
		return 'revisions-update-current-before--/panel/history/revisions/preview';
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

export default RevisionsUpdateCurrentBefore;
