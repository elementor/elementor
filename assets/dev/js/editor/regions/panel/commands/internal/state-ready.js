import CommandInternalBase from 'elementor-api/modules/command-internal-base';

export class StateReady extends CommandInternalBase {
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
