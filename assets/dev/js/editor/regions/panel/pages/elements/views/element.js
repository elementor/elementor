module.exports = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-element-library-element',

	className: 'elementor-element-wrapper',

	ui: {
		element: '.elementor-element',
	},

	onRender: function() {
		if ( ! elementor.userCan( 'design' ) ) {
			return;
		}

		this.ui.element.html5Draggable( {

			onDragStart: () => {
				elementor.channels.panelElements
						.reply( 'element:selected', this )
						.trigger( 'element:drag:start' );
			},

			onDragEnd: () => {
				elementor.channels.panelElements.trigger( 'element:drag:end' );
			},

			groups: [ 'elementor-element' ],
		} );
	},
} );
