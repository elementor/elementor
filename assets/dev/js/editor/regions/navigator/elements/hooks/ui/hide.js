import After from 'elementor-api/modules/hooks/ui/after';

export class Hide extends After {
	getCommand() {
		return 'navigator/elements/hide';
	}

	getId() {
		return 'navigator-elements-hide';
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( /* Container */ container ) => {
			container.view.toggleVisibilityClass();
		} );
	}
}

export default Hide;
