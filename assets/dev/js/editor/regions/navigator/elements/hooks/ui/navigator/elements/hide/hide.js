import After from 'elementor-api/modules/hooks/ui/after';
import Helper from '../helper.js';

export class NavigatorHide extends After {
	getCommand() {
		return 'navigator/elements/hide';
	}

	getId() {
		return 'navigator-elements-hide--/navigator/elements/hide';
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( container ) => {
			Helper.toggleVisibilityClass( container.id );
		} );
	}
}

export default NavigatorHide;
