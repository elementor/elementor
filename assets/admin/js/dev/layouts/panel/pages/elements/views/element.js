var PanelElementsElementView;

PanelElementsElementView = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-element-library-element',

	className: 'elementor-element-wrapper',

	events: {
		click: 'onClick'
	},

	triggers: {
		dragend: 'drag:end'
	},

	onRender: function() {
		this.$el.html5Draggable( {

			onDragStart: _.bind( function() {
				this.triggerMethod( 'drag:start' );
			}, this ),

			groups: [ 'elementor-element' ]
		} );
	}
} );

module.exports = PanelElementsElementView;
