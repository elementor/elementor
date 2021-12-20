import CommandNavigator from 'elementor-regions/navigator/elements/commands/base/command-navigator';

export class ToggleFoldingAll extends CommandNavigator {
	apply( args ) {
		const layout = this.component.manager.region.getLayout(),
			state = args.hasOwnProperty( 'state' ) ? args.state : 'expand' === layout.ui.toggleAll.data( 'elementor-action' );

		elementor.getPreviewContainer().children.forEachRecursive( ( container ) => {
			$e.run( 'navigator/elements/toggle-folding', {
				container,
				state,
			} );
		} );

		layout.ui.toggleAll
			.data( 'elementor-action', state ? 'collapse' : 'expand' )
			.toggleClass( 'eicon-collapse', state )
			.toggleClass( 'eicon-expand', ! state );
	}

	shouldRequireContainer() {
		return false;
	}
}

export default ToggleFoldingAll;
