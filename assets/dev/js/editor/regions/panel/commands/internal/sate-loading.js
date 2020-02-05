import CommandInternalBase from 'elementor-api/modules/command-internal-base';

export class StateLoading extends CommandInternalBase {
	apply( args ) {
		elementorCommon.elements.$body.addClass( 'elementor-panel-loading' )
	}
}

export default StateLoading;
