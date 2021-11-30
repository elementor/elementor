import After from 'elementor-api/modules/hooks/ui/after';

export default class Base extends After {
	get component() {
		return $e.components.get( 'navigator' );
	}

	getConditions( args ) {
		const { containers = [ args.container ] } = args;

		// Ensuring the component is open and every container has valid navigator element view.
		return this.component.isOpen && containers.every(
			( container ) => this.component.elements.getElementView( container.id )
		);
	}
}
