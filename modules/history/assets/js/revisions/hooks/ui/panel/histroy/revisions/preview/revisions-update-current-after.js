import HookUIAfter from 'elementor-api/modules/hooks/ui/after';

export class RevisionsUpdateCurrentAfter extends HookUIAfter {
	getCommand() {
		return 'panel/history/revisions/preview';
	}

	getId() {
		return 'revisions-update-current-after--/panel/history/revisions/preview';
	}

	apply( args ) {
		const { view } = args;

		view.$el.removeClass( 'elementor-revision-item-loading' );
	}
}

export default RevisionsUpdateCurrentAfter;
