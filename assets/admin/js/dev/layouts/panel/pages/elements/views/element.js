var PanelElementsElementView;

PanelElementsElementView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-element-library-element',

	className: 'elementor-element-wrapper',

	onRender: function() {
		var self = this;

		this.$el.html5Draggable( {

			onDragStart: _.bind( function() {
				this.triggerMethod( 'drag:start' );
			}, this ),

			groups: [ 'elementor-element' ]
		} );
	}
} );

module.exports = PanelElementsElementView;
