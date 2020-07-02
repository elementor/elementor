import CommandInternalBase from 'elementor-api/modules/command-internal-base';

export class StateReady extends CommandInternalBase {
	apply() {
		elementorCommon.elements.$body.removeClass( 'elementor-panel-loading' );
	}
}

export default StateReady;
