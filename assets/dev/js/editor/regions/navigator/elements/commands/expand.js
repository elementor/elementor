import CommandBase from 'elementor-api/modules/command-base';

export class Expand extends CommandBase {
	validateArgs( args ) {
		this.requireContainer( args );
	}

	apply( args ) {
		const { containers = [ args.container ], callback } = args;

		containers.forEach( ( container ) => {
			const element = container.navView;

			// TODO: move to UI HOOK.
			element.ui.item.toggleClass( 'elementor-active', true );

			element.ui.elements.slideDown( 300, callback );
		} );
	}
}

export default Expand;
