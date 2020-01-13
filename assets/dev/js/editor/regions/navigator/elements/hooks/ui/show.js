import After from 'elementor-api/modules/hooks/ui/after';

export class Show extends After {
	getCommand() {
		return 'navigator/elements/show';
	}

	getId() {
		return 'navigator-elements-show';
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( /* Container */ container ) => {
			container.view.toggleVisibilityClass();
		} );
	}
}

export default Show;
