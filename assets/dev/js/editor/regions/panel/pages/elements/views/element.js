module.exports = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-element-library-element',

	className: function() {
		let className = 'elementor-element-wrapper';

		if ( ! this.isEditable() ) {
			className += ' elementor-element--promotion';
		}

		return className;
	},

	events: function() {
		const events = {};

		if ( ! this.isEditable() ) {
			events.mousedown = 'onMouseDown';
		}

		return events;
	},

	ui: {
		element: '.elementor-element',
	},

	isEditable: function() {
		return false !== this.model.get( 'editable' );
	},

	onRender: function() {
		if ( ! elementor.userCan( 'design' ) || ! this.isEditable() ) {
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

	onMouseDown: function() {
		elementor.promotion.showDialog( {
			headerMessage: elementor.translate( 'element_promotion_dialog_header', [ this.model.get( 'title' ) ] ),
			message: elementor.translate( 'element_promotion_dialog_message', [ this.model.get( 'title' ) ] ),
			top: '-7',
			element: this.el,
			actionURL: elementor.config.elementPromotionURL.replace( '%s', this.model.get( 'name' ) ),
		} );
	},
} );
