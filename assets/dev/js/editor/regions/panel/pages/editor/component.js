export default class extends elementorModules.Component {
	activateTab( tab, args ) {
		const pageName = elementor.getPanelView().getCurrentPageName();

		if ( 'elements' !== pageName ) {
			this.openEditor( args.model, args.view );
		}

		elementor.getPanelView().getCurrentPageView().activateTab( tab )._renderChildren();
	}

	getTabs() {
		return {
			content: elementor.translate( 'content' ),
			style: elementor.translate( 'style' ),
			advanced: elementor.translate( 'advanced' ),
			layout: elementor.translate( 'layout' ),
		};
	}

	openEditor( model, view ) {
		const title = elementor.translate( 'edit_element', [ elementor.getElementData( model ).title ] );
		elementor.getPanelView().setPage( 'editor', title, {
			model: model,
			controls: elementor.getElementControls( model ),
			editedElementView: view,
		} );

		const action = 'panel/open_editor/' + model.get( 'elType' );

		// Example: panel/open_editor/widget
		elementor.hooks.doAction( action, this, model, view );

		// Example: panel/open_editor/widget/heading
		elementor.hooks.doAction( action + '/' + model.get( 'widgetType' ), this, model, view );
	}
}
