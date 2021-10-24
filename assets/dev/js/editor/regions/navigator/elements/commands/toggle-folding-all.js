import CommandBase from 'elementor-api/modules/command-base';

export class ToggleFoldingAll extends CommandBase {
	apply( args ) {
		const layout = this.component.manager.region.getLayout(),
			state = args.hasOwnProperty( 'state' ) ? args.state : 'expand' === layout.ui.toggleAll.data( 'elementor-action' );

		let	classes = [ 'eicon-collapse', 'eicon-expand' ];

		elementor.getPreviewContainer().children.forEachRecursive( ( container ) => {
			$e.run( 'navigator/elements/toggle-folding', {
				container,
				state,
			} );
		} );

		if ( ! state ) {
			classes = classes.reverse();
		}

		layout.ui.toggleAll
			.data( 'elementor-action', state ? 'collapse' : 'expand' )
			.removeClass( classes[ 0 ] )
			.addClass( classes[ 1 ] );
	}
}

export default ToggleFoldingAll;
