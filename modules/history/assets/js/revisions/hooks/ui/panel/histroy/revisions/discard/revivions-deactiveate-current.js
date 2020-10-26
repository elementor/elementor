import HookUIAfter from 'elementor-api/modules/hooks/ui/after';

export class RevisionsDeactivateCurrent extends HookUIAfter {
	getCommand() {
		return 'panel/history/revisions/discard';
	}

	getId() {
		return 'revisions-deactivate-current--/panel/history/revisions/discard';
	}

	apply( args ) {
		const component = $e.components.get( 'panel/history/revisions' );

		component.tab.setRevisionsButtonsActive( false );

		if ( component.currentPreviewItem ) {
			component.currentPreviewItem.$el.removeClass( 'elementor-revision-current-preview' );
		}
	}
}

export default RevisionsDeactivateCurrent;
