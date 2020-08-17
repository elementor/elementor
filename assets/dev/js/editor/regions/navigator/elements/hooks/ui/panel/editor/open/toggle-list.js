import After from 'elementor-api/modules/hooks/ui/after';

export class NavigatorToggleList extends After {
	getCommand() {
		return 'panel/editor/open';
	}

	getId() {
		return 'navigator-toggle-list--/panel/editor/open';
	}

	apply( args ) {
		const container = args.view.getContainer(),
			navView = container.navView;

		// TODO: Remove with 'container.navView'.
		// Since 'panel/editor/open' for widget applies before the container exist.
		if ( ! navView ) {
			return setTimeout( () => this.apply( args ) );
		}

		this.toggleList( navView );
	}

	toggleList( navView ) {
		navView.recursiveParentInvoke( 'toggleList', true );

		elementor.navigator.getLayout().elements.currentView.recursiveChildInvoke( 'removeEditingClass' );

		navView.addEditingClass();

		elementor.helpers.scrollToView( navView.$el, 400, elementor.navigator.getLayout().elements.$el );
	}
}

export default NavigatorToggleList;
