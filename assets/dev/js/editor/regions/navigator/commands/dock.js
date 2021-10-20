import CommandBase from 'elementor-api/modules/command-base';

export class Dock extends CommandBase {
	apply() {
		if ( this.component.isDocked ) {
			return false;
		}

		// TODO: Hook UI or Use the new uiState manager.
		elementorCommon.elements.$body.addClass( 'elementor-navigator-docked' );

		$e.internal( 'navigator/set-size' );

		const { region } = this.component,
			resizableOptions = region.getResizableOptions();

		region.$el.css( {
			height: '',
			top: '',
			bottom: '',
			left: '',
			right: '',
		} );

		if ( region.$el.resizable( 'instance' ) ) {
			region.$el.resizable( 'destroy' );
		}

		resizableOptions.handles = elementorCommon.config.isRTL ? 'e' : 'w';

		region.$el.resizable( resizableOptions );

		this.component.isDocked = true;

		region.saveStorage( 'docked', true );

		return true;
	}
}

export default Dock;
