var HandleDuplicateBehavior;

HandleDuplicateBehavior = Marionette.Behavior.extend( {

	onChildviewClickDuplicate: function( childView ) {
		if ( this.view.isCollectionFilled() ) {
			return;
		}

		var currentIndex = childView.$el.index() + 1,
			newModel = childView.model.clone();

		this.view.addChildModel( newModel, { at: currentIndex } );
	}
} );

module.exports = HandleDuplicateBehavior;
