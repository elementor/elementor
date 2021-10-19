import CommandBase from 'elementor-api/modules/command-base';

export class Undock extends CommandBase {
	apply( args ) {
		const { silent } = args;

		if ( ! elementor.navigator.isDocked ) {
			return false;
		}

		// TODO: Hook UI or Use the new uiState manager.
		elementorCommon.elements.$body.removeClass( 'elementor-navigator-docked' );

		$e.internal( 'navigator/set-size' );

		elementor.$previewWrapper.css( elementorCommon.config.isRTL ? 'left' : 'right', '' );

		if ( elementor.navigator.$el.resizable( 'instance' ) ) {
			elementor.navigator.$el.resizable( 'destroy' );

			elementor.navigator.$el.resizable( elementor.navigator.getResizableOptions() );
		}

		elementor.navigator.isDocked = false;

		if ( ! silent ) {
			elementor.navigator.saveStorage( 'docked', false );
		}

		return true;
	}
}

export default Undock;
