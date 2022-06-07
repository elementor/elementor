import ContextMenu from 'elementor-behaviors/context-menu';

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

	behaviors: function() {
		const groups = elementor.hooks.applyFilters( 'panel/element/contextMenuGroups', [], this ),
			behaviors = {};

		if ( groups.length ) {
			behaviors.contextMenu = {
				behaviorClass: ContextMenu,
				context: 'panel',
				groups,
			};
		}

		return elementor.hooks.applyFilters( 'panel/element/behaviors', behaviors, this );
	},

	isEditable: function() {
		return false !== this.model.get( 'editable' );
	},

	onRender: function() {
		if ( ! elementor.userCan( 'design' ) || ! this.isEditable() ) {
			return;
		}

		const helper = this.ui.element.clone()[ 0 ];
		helper.classList.add( 'elementor-sortable-helper' );

		this.ui.element.html5Draggable( {
			onDragStart: ( e ) => {
				elementor.$previewContents[ 0 ].body.appendChild( helper );

				e.originalEvent.dataTransfer.setDragImage( helper, 25, 20 );

				elementor.getPanelView()._parent.close();

				// Reset the sort cache.
				elementor.channels.editor.reply( 'element:dragged', null );

				elementor.channels.panelElements
					.reply( 'element:selected', this )
					.trigger( 'element:drag:start' );
			},

			onDragEnd: () => {
				elementor.channels.panelElements.trigger( 'element:drag:end' );

				helper.remove();
			},

			groups: [ 'elementor-element' ],
		} );
	},

	onMouseDown: function() {
		const title = this.model.get( 'title' );

		elementor.promotion.showDialog( {
			/* translators: %s: Widget title. */
			headerMessage: sprintf( __( '%s Widget', 'elementor' ), title ),
			/* translators: %s: Widget title. */
			message: sprintf( __( 'Use %s widget and dozens more pro features to extend your toolbox and build sites faster and better.', 'elementor' ), title ),
			top: '-7',
			element: this.el,
			actionURL: elementor.config.elementPromotionURL.replace( '%s', this.model.get( 'name' ) || this.model.get( 'widgetType' ) ),
		} );
	},
} );
