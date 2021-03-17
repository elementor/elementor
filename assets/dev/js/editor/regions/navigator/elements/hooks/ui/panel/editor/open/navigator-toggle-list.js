import After from 'elementor-api/modules/hooks/ui/after';

export class NavigatorToggleList extends After {
	getCommand() {
		return 'panel/editor/open';
	}

	getId() {
		return 'navigator-toggle-list--/panel/editor/open';
	}

	getConditions( args ) {
		return args.view.container.navigator.view;
	}

	apply( args ) {
		this.toggleList( args.view.container.navigator.view );
	}

	/**
	 * @param {e.elementor.navigator.Element} view
	 */
	toggleList( view ) {
		view.recursiveParentInvoke( 'toggleList', true );

		elementor.navigator.getLayout().elements.currentView.recursiveChildInvoke( 'removeEditingClass' );

		view.addEditingClass();

		elementor.helpers.scrollToView( view.$el, 400, elementor.navigator.getLayout().elements.$el );
	}
}

export default NavigatorToggleList;
