import CommandInternal from 'elementor-api/modules/command-internal';

export class StateReady extends CommandInternal {
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
