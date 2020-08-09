import CommandInternal from 'elementor-api/modules/command-internal';

export class StateReady extends CommandInternal {
	apply() {
		elementorCommon.elements.$body.removeClass( 'elementor-panel-loading' );
	}
}

export default StateReady;
