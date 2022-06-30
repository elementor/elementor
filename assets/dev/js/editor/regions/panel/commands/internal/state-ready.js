export class StateReady extends $e.modules.CommandInternalBase {
	apply() {
		elementorCommon.elements.$body.removeClass( 'elementor-panel-loading' );
	}
}

export default StateReady;
