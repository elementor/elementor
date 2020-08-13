import CommandBase from 'elementor-api/modules/command-base';

export class Undock extends CommandBase {
	apply( args ) {
		const { silent } = args;

		// TODO: Move to UI hook
		elementorCommon.elements.$body.removeClass( 'elementor-navigator-docked' );

		elementor.$previewWrapper.css( elementorCommon.config.isRTL ? 'left' : 'right', '' );

		elementor.navigator.setSize();

		elementor.navigator.$el.resizable( 'destroy' );

		elementor.navigator.$el.resizable( elementor.navigator.getResizableOptions() );

		elementor.navigator.isDocked = false;

		if ( ! silent ) {
			elementor.navigator.saveStorage( 'docked', false );
		}
	}
}

export default Undock;
