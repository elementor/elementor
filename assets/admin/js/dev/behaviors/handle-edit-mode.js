var HandleEditModeBehavior;

HandleEditModeBehavior = Marionette.Behavior.extend( {
	initialize: function() {
		this.listenTo( elementor.dataEditMode, 'switch', this.onEditModeSwitched );
	},

	onEditModeSwitched: function() {
		var activeMode = elementor.dataEditMode.request( 'activeMode' );

		this.view.$el.toggleClass( 'elementor-active-mode', 'preview' !== activeMode );
	},

	onRender: function() {
		this.onEditModeSwitched();
	}
} );

module.exports = HandleEditModeBehavior;
