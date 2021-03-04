import After from 'elementor-api/modules/hooks/ui/after';

export class NavigatorElementsHide extends After {
	getCommand() {
		return 'navigator/elements/hide';
	}

	getId() {
		return 'navigator-elements-hide--/navigator/elements/hide';
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( container ) => container.view.toggleVisibilityClass() );
	}
}

export default NavigatorElementsHide;
