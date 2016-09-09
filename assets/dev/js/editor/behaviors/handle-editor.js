var HandleEditorBehavior;

HandleEditorBehavior = Marionette.Behavior.extend( {

	onClickEdit: function() {
		var activeMode = elementor.channels.dataEditMode.request( 'activeMode' );

		if ( 'preview' === activeMode ) {
			return;
		}

		this.onOpenEditor();
	},

	onOpenEditor: function() {
		var currentPanelPageName = elementor.getPanelView().getCurrentPageName();

		if ( 'editor' === currentPanelPageName ) {
			var currentPanelPageView = elementor.getPanelView().getCurrentPageView(),
				currentEditableModel = currentPanelPageView.model;

			if ( currentEditableModel === this.view.model ) {
				return;
			}
		}

		var elementData = elementor.getElementData( this.view.model );

		elementor.getPanelView().setPage( 'editor', elementor.translate( 'edit_element', [ elementData.title ] ), {
			model: this.view.model,
			editedElementView: this.view
		} );
	}
} );

module.exports = HandleEditorBehavior;
