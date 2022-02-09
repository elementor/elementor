import CommandBase from 'elementor-api/modules/command-base';

export class Undock extends CommandBase {
	apply( args ) {
		const { silent } = args;

		if ( ! this.component.isDocked ) {
			return false;
		}

		const { region } = this.component;

		// TODO: Hook UI or Use the new uiState manager.
		elementorCommon.elements.$body.removeClass( 'elementor-navigator-docked' );

		$e.internal( 'navigator/set-size' );

		elementor.$previewWrapper.css( elementorCommon.config.isRTL ? 'left' : 'right', '' );

		if ( region.$el.resizable( 'instance' ) ) {
			region.$el.resizable( 'destroy' );

			region.$el.resizable( region.getResizableOptions() );
		}

		this.component.isDocked = false;

		if ( ! silent ) {
			region.saveStorage( 'docked', false );
		}

		return true;
	}
}

export default Undock;
