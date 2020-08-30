import HookUICatch from 'elementor-api/modules/hooks/ui/catch';

export class RevisionsUpdateCurrentCatch extends HookUICatch {
	getCommand() {
		return 'panel/history/revisions/preview';
	}

	getId() {
		return 'revisions-update-current-catch--/panel/history/revisions/preview';
	}

	apply( args ) {
		const { view } = args;

		view.$el.removeClass( 'elementor-revision-item-loading' );
	}
}

export default RevisionsUpdateCurrentCatch;
