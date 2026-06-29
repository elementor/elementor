import ContextMenu from 'elementor-behaviors/context-menu';

module.exports = Marionette.ItemView.extend( {
	template: '#tmpl-elementor-element-library-element',

	className() {
		let className = 'elementor-element-wrapper';

		if ( ! this.isEditable() && ! this.isAtomicWidgetPromotion() && ! this.isBirthdayEasterEgg() ) {
			className += ' elementor-element--promotion';
		}

		if ( this.isIntegration() ) {
			className += ' elementor-element--integration';
		}

		return className;
	},

	events() {
		const events = {};

		if ( ! this.isEditable() && ! this.isBirthdayEasterEgg() ) {
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

	isIntegration() {
		return !! this.model.get( 'integration' );
	},

	isAtomicWidgetPromotion() {
		return !! this.model.get( 'promotionType' );
	},

	isBirthdayEasterEgg() {
		return !! this.model.get( 'birthdayEasterEgg' );
	},

	onRender() {
		if ( ! elementor.userCan( 'design' ) ) {
			return;
		}

		if ( this.isBirthdayEasterEgg() ) {
			this.ui.element.on( 'click', () => this.openBirthdayEasterEgg() );
			this.bindBirthdayEasterEggDrag();
			return;
		}

		if ( ! this.isEditable() ) {
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

	bindBirthdayEasterEggDrag() {
		this.ui.element.html5Draggable( {
			onDragStart: () => {
				elementor.channels.editor.reply( 'element:dragged', null );

				elementor.channels.panelElements
					.reply( 'element:selected', this )
					.trigger( 'element:drag:start' );
			},

			onDragEnd: () => {
				elementor.channels.panelElements.trigger( 'element:drag:end' );
				this.openBirthdayEasterEgg();
			},

			groups: [ 'elementor-element' ],
		} );
	},

	openBirthdayEasterEgg() {
		document.dispatchEvent( new CustomEvent( 'birthday-easter-egg:open', {
			detail: { target: this.el },
		} ) );
	},

	onMouseDown( event ) {
		event.stopPropagation();

		if ( this.isAtomicWidgetPromotion() ) {
			const promotionType = this.model.get( 'promotionType' );
			document.dispatchEvent( new CustomEvent( `${ promotionType }-promotion:open`, {
				detail: { target: this.el },
			} ) );
			return;
		}

		const widgetTitle = this.model.get( 'title' ),
			widgetType = this.model.get( 'name' ) || this.model.get( 'widgetType' ),
			isIntegration = this.isIntegration(),
			configPromotion = elementor.config.promotion;

		let ctaUrl, ctaText, title, content;

		if ( isIntegration ) {
			const integrationPromo = configPromotion?.integration?.[ widgetType ];
			ctaUrl = integrationPromo.action_button.url.toString().replaceAll( '&amp;', '&' );
			ctaText = integrationPromo.action_button.text;
			// eslint-disable-next-line @wordpress/valid-sprintf
			title = sprintf( integrationPromo.title, widgetTitle );
			// eslint-disable-next-line @wordpress/valid-sprintf
			content = sprintf( integrationPromo.content, widgetTitle );
		}

		document.dispatchEvent( new CustomEvent( 'widget-promotion:open', {
			detail: {
				target: this.el,
				widgetType,
				widgetTitle,
				title,
				content,
				ctaUrl,
				ctaText,
				hideProTag: isIntegration,
			},
		} ) );
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

		const modelData = this.model.toJSON();

		$e.run( 'preview/drop', {
			container,
			options: {
				...options,
				scrollIntoView: true,
			},
			model: modelData,
		} );

		if ( elementorCommon?.eventsManager?.dispatchEvent ) {
			const elType = modelData?.elType ?? '';
			const widgetType = modelData?.widgetType ?? '';
			const elementName = 'widget' === elType ? widgetType : elType;

			elementorCommon.eventsManager.dispatchEvent( 'add_element', {
				location: 'editor_panel',
				element_name: elementName,
				element_type: elType,
				widget_type: widgetType,
			} );
		}
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
