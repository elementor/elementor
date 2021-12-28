import After from 'elementor-api/modules/hooks/ui/after';

/**
 * Navigator toggle list hook, is responsible for recursive toggling of selected widget for user indication.
 */
export class NavigatorToggleList extends After {
	getCommand() {
		return 'panel/editor/open';
	}

	getId() {
		return 'navigator-toggle-list';
	}

	getConditions( args ) {
		return $e.components.get( 'navigator' ).isOpen;
	}

	apply( args ) {
		this.toggleList( args.view.container.parent.model.attributes.id );
	}

	/**
	 * @param {string} elementId
	 */
	toggleList( elementId ) {
		if ( 'document' === elementId ) {
			return;
		}

		const container = elementor.getContainer( elementId );

		$e.run( 'navigator/elements/toggle-folding', {
			container,
			state: true,
		} );

		return this.toggleList( container.parent.id );
	}
}

export default NavigatorToggleList;
