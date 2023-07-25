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

		this.ui.element.on( 'click', () => this.addToPage() );

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

		// Order matters.
		const scenariosMap = {
			addToDocument: {
				check: () => ! element,
				getArgs: () => ( {
					view: elementor.getPreviewView(),
					options: {},
				} ),
			},
			addToFirstColumn: {
				check: () => 'section' === element.model.get( 'elType' ),
				getArgs: () => ( {
					view: element.view.children?.findByIndex( 0 ),
					options: {},
				} ),
			},
			addToParent: {
				check: () => 'widget' === element.model.get( 'elType' ),
				getArgs: () => {
					const { parent, model } = element;

					return {
						view: parent.view,
						options: {
							at: parent.model.get( 'elements' ).findIndex( model ) + 1,
						},
					};
				},
			},
			default: {
				check: () => true,
				getArgs: () => ( {
					view: element.view,
					options: {},
				} ),
			},
		};

		const { getArgs } = Object.values( scenariosMap ).find( ( { check } ) => check() );
		const { view, options } = getArgs();
		const container = view.getContainer();

		if ( ! container ) {
			throw new Error( "View doesn't support adding from panel", view );
		}

		if ( this.model.attributes?.custom?.isPreset ?? false ) {
			this.model.set( 'settings', this.model.get( 'custom' ).preset_settings );
		}

		$e.run( 'preview/drop', {
			container,
			options: {
				...options,
				scrollIntoView: true,
			},
			model: this.model.toJSON(),
		} );
	},

	getSelectedElements() {
		return elementor.selection
			.getElements()
			.filter( ( { view } ) => {
				// Remove elements that don't exist in the current document's DOM, because of a bug in
				// the selection manager that doesn't deselect elements properly.
				return elementor.documents.getCurrent().$element?.[ 0 ].contains( view.$el[ 0 ] );
			} );
	},
} );
