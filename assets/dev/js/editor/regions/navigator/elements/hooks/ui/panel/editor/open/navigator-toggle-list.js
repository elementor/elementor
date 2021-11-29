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
		if ( ! $e.components.get( 'navigator' ).isOpen ) {
			return false;
		}

		return true;
	}

	apply( args ) {
		const view = elementor.navigator.elements.getElementView( args.view.model.attributes.id );

		this.toggleList( view );
	}

	/**
	 * @param {Element} view
	 */
	toggleList( view ) {
		view.recursiveParentInvoke( 'toggleList', true );

		const { region } = $e.components.get( 'navigator' ),
			layout = region.getLayout();

		layout.elements.currentView.recursiveChildInvoke( 'removeEditingClass' );

		view.addEditingClass();

		// Scroll into navigator element view.
		$e.internal( 'document/elements/scroll-to-view', {
			$element: view.$el,
			$parent: layout.elements.$el,
			timeout: 400,
		} );
	}
}

export default NavigatorToggleList;
