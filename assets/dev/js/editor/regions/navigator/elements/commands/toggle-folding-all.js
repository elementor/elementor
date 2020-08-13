import CommandBase from 'elementor-api/modules/command-base';

export class ToggleFoldingAll extends CommandBase {
	validateArgs( args ) {
		if ( args.state ) {
			this.requireArgumentType( 'state', 'boolean', args );
		}
	}

	apply( args ) {
		const layout = this.component.manager.manager.getLayout(),
			state = args.hasOwnProperty( 'state' ) ? args.state : 'expand' === layout.ui.toggleAll.data( 'elementor-action' ),
			classes = [ 'eicon-collapse', 'eicon-expand' ];

		layout.ui.toggleAll
			.data( 'elementor-action', state ? 'collapse' : 'expand' )
			.removeClass( classes[ +state ] )
			.addClass( classes[ +! state ] );

		layout.elements.currentView.recursiveChildInvoke( 'toggleList', state );
	}
}

export default ToggleFoldingAll;
