import After from 'elementor-api/modules/hooks/ui/after';

export default class Base extends After {
	get component() {
		return $e.components.get( 'navigator' );
	}

	getConditions( args ) {
		// Ensuring the component is open.
		return this.component.isOpen;
	}
}
