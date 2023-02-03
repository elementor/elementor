export class StateReady extends $e.modules.CommandInternalBase {
	apply() {
		elementorCommon.elements.$body.removeClass( 'elementor-panel-loading' );

		// Cannot be hook because not sure if it affects UI or data.
		if ( ! this.component.stateReadyOnce ) {
			this.component.stateReadyOnce = true;

			$e.extras.hashCommands.runOnce();
		}
	}
}

export default StateReady;
