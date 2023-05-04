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

		events.click = 'addToPage';

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
			promotion = elementor.config.promotion.elements;

		elementor.promotion.showDialog( {
			// eslint-disable-next-line @wordpress/valid-sprintf
			title: sprintf( promotion.title, title ),
			// eslint-disable-next-line @wordpress/valid-sprintf
			content: sprintf( promotion.content, title ),
			targetElement: this.el,
			position: {
				blockStart: '-7',
			},
			actionButton: {
				// eslint-disable-next-line @wordpress/valid-sprintf
				url: sprintf( promotion.action_button.url, widgetType ),
				text: promotion.action_button.text,
				classes: promotion.action_button.classes || [ 'elementor-button', 'go-pro' ],
			},
		} );
	},

	addToPage() {
		const selectedElements = this.getSelectedElements();
		const isMultiSelect = selectedElements.length > 1;

		// Currently, we don't support multi-selected elements.
		if ( isMultiSelect ) {
			return;
		}

		const [ element ] = selectedElements;
		const { view, options } = this.getDroppingOptions( element );

		if ( ! view?.addElementFromPanel ) {
			return;
		}

		elementor.channels.panelElements.reply( 'element:selected', this );

		view.addElementFromPanel( {
			...options,
			scrollIntoView: true,
		} );
	},

	getSelectedElements() {
		return elementor.selection
			.getElements()
			.filter( ( { view } ) => {
				// Remove elements that don't exist in the DOM, because of a bug in the selection manager
				// that returns also elements that were removed from the DOM.
				return elementor.$previewContents[ 0 ].contains( view.$el[ 0 ] );
			} );
	},

	getDroppingOptions( element ) {
		const shouldDropToDocument = ! element;

		if ( shouldDropToDocument ) {
			return {
				view: elementor.getPreviewView(),
				options: {},
			};
		}

		const shouldDropToColumn = 'section' === element.model.get( 'elType' );

		if ( shouldDropToColumn ) {
			return {
				view: element.view.children.findByIndex( 0 ),
				options: {},
			};
		}

		const shouldDropToParent = 'widget' === element.model.get( 'elType' );

		if ( shouldDropToParent ) {
			const { parent, model } = element;

			return {
				view: parent.view,
				options: {
					at: parent.model.get( 'elements' ).findIndex( model ) + 1,
				},
			};
		}

		return {
			view: element.view,
			options: {},
		};
	},
} );
