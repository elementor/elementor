import After from 'elementor-api/modules/hooks/ui/after';
import Helper from '../helper';

export class NavigatorShow extends After {
	getCommand() {
		return 'navigator/elements/show';
	}

	getId() {
		return 'navigator-elements-show--/navigator/elements/show';
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( container ) => {
			Helper.toggleVisibilityClass( container.id );
		} );
	}
}

export default NavigatorShow;
