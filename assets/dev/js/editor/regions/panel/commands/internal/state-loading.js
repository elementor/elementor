import CommandInternal from 'elementor-api/modules/command-internal';

export class StateLoading extends CommandInternal {
	apply() {
		elementorCommon.elements.$body.addClass( 'elementor-panel-loading' );
	}
}

export default StateLoading;
