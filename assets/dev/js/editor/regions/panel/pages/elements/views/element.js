import ContextMenu from 'elementor-behaviors/context-menu';

module.exports = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-element-library-element',

	className() {
		let className = 'elementor-element-wrapper';

		if ( ! this.isEditable() ) {
			className += ' elementor-element--promotion';
		}

		return className;
	},

	events() {
		const events = {};

		if ( ! this.isEditable() ) {
			events.mousedown = 'onMouseDown';
		}

		return events;
	},

	ui: {
		element: '.elementor-element',
	},

	behaviors() {
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

	isEditable() {
		return false !== this.model.get( 'editable' );
	},

	onRender() {
		if ( ! elementor.userCan( 'design' ) || ! this.isEditable() ) {
			return;
		}

		this.ui.element.html5Draggable( {
			onDragStart: () => {
				// Reset the sort cache.
				elementor.channels.editor.reply( 'element:dragged', null );

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

	onMouseDown() {
		const title = this.model.get( 'title' ),
			widgetType = this.model.get( 'name' ) || this.model.get( 'widgetType' ),
			hasProAndNotConnected = elementor.helpers.hasProAndNotConnected(),
			dialogOptions = {
				/* translators: %s: Widget title. */
				title: sprintf( __( '%s Widget', 'elementor' ), title ),
				content: sprintf(
					__(
						'Use %s widget and dozens more pro features to extend your toolbox and build sites faster and better.',
						'elementor',
					),
					title,
				),
				targetElement: this.el,
				position: {
					blockStart: '-7',
				},
				actionButton: {
					url: hasProAndNotConnected
						? elementorProEditorConfig.urls.connect
						/* translators: %s: Widget title. */
						: elementor.config.elementPromotionURL.replace( '%s', widgetType ),
					text: hasProAndNotConnected
						? __( 'Connect & Activate', 'elementor' )
						: __( 'See it in Action', 'elementor' ),
				},
			};

		elementor.promotion.showDialog( dialogOptions );
	},
} );
