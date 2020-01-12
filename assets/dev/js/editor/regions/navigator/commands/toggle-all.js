import CommandBase from 'elementor-api/modules/command-base';

export class ToggleAll extends CommandBase {
	apply( args ) {
		const layout = this.component.manager.getLayout(),
			state = 'expand' === layout.ui.toggleAll.data( 'elementor-action' ),
			classes = [ 'eicon-collapse', 'eicon-expand' ];

		layout.ui.toggleAll
			.data( 'elementor-action', state ? 'collapse' : 'expand' )
			.removeClass( classes[ +state ] )
			.addClass( classes[ +! state ] );

		layout.elements.currentView.recursiveChildInvoke( 'toggleList', state );
	}
}

export default ToggleAll;
