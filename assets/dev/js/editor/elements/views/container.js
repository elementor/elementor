// Most of the code has been copied from `section.js`.
import AddSectionView from 'elementor-views/add-section/inline';
import WidgetResizable from './behaviors/widget-resizeable';
import ContainerHelper from 'elementor-editor-utils/container-helper';
import EmptyView from 'elementor-elements/views/container/empty-view';

const BaseElementView = require( 'elementor-elements/views/base' );
const ContainerView = BaseElementView.extend( {
	template: Marionette.TemplateCache.get( '#tmpl-elementor-container-content' ),

	emptyView: EmptyView,

	destroyEmptyView() {
		// Do not remove the empty view for Grid Containers.
		if ( this.isFlexContainer() ) {
			return Marionette.CompositeView.prototype.destroyEmptyView.apply( this, arguments );
		}
	},

	getChildViewContainer() {
		this.childViewContainer = this.isBoxedWidth()
			? '> .e-con-inner'
			: '';

		return Marionette.CompositeView.prototype.getChildViewContainer.apply( this, arguments );
	},

	className() {
		return `${ BaseElementView.prototype.className.apply( this ) } e-con`;
	},

	childViewOptions() {
		return {
			emptyViewOwner: this,
		};
	},

	tagName() {
		return this.model.getSetting( 'html_tag' ) || 'div';
	},

	// TODO: Copied from `views/column.js`.
	ui() {
		var ui = BaseElementView.prototype.ui.apply( this, arguments );

		ui.percentsTooltip = '> .elementor-element-overlay .elementor-column-percents-tooltip';

		return ui;
	},

	getCurrentUiStates() {
		const currentDirection = this.container.settings.get( this.getDirectionSettingKey() );

		return {
			directionMode: currentDirection || ContainerHelper.DIRECTION_DEFAULT,
		};
	},

	getDirectionSettingKey() {
		const containerType = this.container.settings.get( 'container_type' ),
			directionSettingKey = 'grid' === containerType
				? 'grid_auto_flow'
				: 'flex_direction';

		return directionSettingKey;
	},

	behaviors() {
		const behaviors = BaseElementView.prototype.behaviors.apply( this, arguments );

		_.extend( behaviors, {
			// TODO: Remove. It's a temporary solution for the Navigator sortable.
			Sortable: {
				behaviorClass: require( 'elementor-behaviors/sortable' ),
				elChildType: 'widget',
			},
			Resizable: {
				behaviorClass: WidgetResizable,
			},
		} );

		return elementor.hooks.applyFilters( 'elements/container/behaviors', behaviors, this );
	},

	initialize() {
		BaseElementView.prototype.initialize.apply( this, arguments );

		this.model.get( 'editSettings' ).set( 'defaultEditRoute', 'layout' );
	},

	/**
	 * TODO: Remove. It's a temporary solution for the Navigator sortable.
	 *
	 * @return {{}} options
	 */
	getSortableOptions() {
		// TODO: Temporary hack.
		return {
			preventInit: true,
		};
	},

	/**
	 * Get the Container nesting level recursively.
	 * The farthest parent Container is level 0.
	 *
	 * @return {number} nesting level
	 */
	getNestingLevel() {
		// Use the memoized value if present, to prevent too many calculations.
		if ( this.nestingLevel ) {
			return this.nestingLevel;
		}

		const parent = this.container.parent;

		// Start counting nesting level only from the closest Container parent.
		if ( 'container' !== parent.type ) {
			return 0;
		}

		return parent.view.getNestingLevel() + 1;
	},

	getDroppableAxis() {
		const isColumnDefault = ( ContainerHelper.DIRECTION_DEFAULT === ContainerHelper.DIRECTION_COLUMN ),
			currentDirection = this.getContainer().settings.get( this.getDirectionSettingKey() );

		const axisMap = {
			[ ContainerHelper.DIRECTION_COLUMN ]: 'vertical',
			[ ContainerHelper.DIRECTION_COLUMN_REVERSED ]: 'vertical',
			[ ContainerHelper.DIRECTION_ROW ]: 'horizontal',
			[ ContainerHelper.DIRECTION_ROW_REVERSED ]: 'horizontal',
			'': isColumnDefault ? 'vertical' : 'horizontal',
		};

		return axisMap[ currentDirection ];
	},

	getDroppableOptions() {
		const items = this.isBoxedWidth()
		? '> .elementor-widget, > .e-con-full, > .e-con > .e-con-inner, > .elementor-empty-view > .elementor-first-add'
		: '> .elementor-element, > .elementor-empty-view .elementor-first-add';

		return {
			axis: this.getDroppableAxis(),
			items,
			groups: [ 'elementor-element' ],
			horizontalThreshold: 5, // TODO: Stop the magic.
			isDroppingAllowed: this.isDroppingAllowed.bind( this ),
			currentElementClass: 'elementor-html5dnd-current-element',
			placeholderClass: 'elementor-sortable-placeholder elementor-widget-placeholder',
			hasDraggingOnChildClass: 'e-dragging-over',
			getDropContainer: () => this.getContainer(),
			onDropping: ( side, event ) => {
				event.stopPropagation();

				// Triggering drag end manually, since it won't fired above iframe
				elementor.getPreviewView().onPanelElementDragEnd();

				const draggedView = elementor.channels.editor.request( 'element:dragged' ),
					draggingInSameParent = ( draggedView?.parent === this ),
					hasInnerContainer = jQuery( event.currentTarget ).hasClass( 'e-con-inner' ),
					containerSelector = hasInnerContainer ? event.currentTarget.parentElement.parentElement : event.currentTarget.parentElement;

				let $elements = jQuery( containerSelector ).find( '> .elementor-element' );

				// Exclude the dragged element from the indexing calculations.
				if ( draggingInSameParent ) {
					$elements = $elements.not( draggedView.$el );
				}

				const widgetsArray = Object.values( $elements );

				let newIndex = hasInnerContainer ? widgetsArray.indexOf( event.currentTarget.parentElement ) : widgetsArray.indexOf( event.currentTarget );

				// Plus one in order to insert it after the current target element.
				if ( this.shouldIncrementIndex( side ) ) {
					newIndex++;
				}

				// User is sorting inside a Container.
				if ( draggedView ) {
					// Prevent the user from dragging a parent container into its own child container
					const draggedId = draggedView.getContainer().id;

					let currentTargetParentContainer = this.container;

					while ( currentTargetParentContainer ) {
						if ( currentTargetParentContainer.id === draggedId ) {
							return;
						}

						currentTargetParentContainer = currentTargetParentContainer.parent;
					}

					// Reset the dragged element cache.
					elementor.channels.editor.reply( 'element:dragged', null );

					$e.run( 'document/elements/move', {
						container: draggedView.getContainer(),
						target: this.getContainer(),
						options: {
							at: newIndex,
						},
					} );

					return;
				}

				// User is dragging an element from the panel.
				this.onDrop( event, { at: newIndex } );
			},
		};
	},

	/**
	 * Save container as a template.
	 *
	 * @return {void}
	 */
	saveAsTemplate() {
		$e.route( 'library/save-template', {
			model: this.model,
		} );
	},

	/**
	 * Insert a new container inside an existing container.
	 *
	 * @since 3.7.0
	 *
	 * @return {void}
	 */
	addNewContainer() {
		/* Check if the current container has a parent container */
		const containerAncestry = this.getContainer().getParentAncestry(),
			targetContainer = ( 'container' !== containerAncestry[ 1 ].type ) ? this.getContainer() : this.getContainer().parent;

		$e.run( 'document/elements/create', {
			model: {
				elType: 'container',
				settings: {
					content_width: 'full',
				},
			},
			container: targetContainer,
		} );
	},

	/**
	 * Add a `Save as Template` button to the context menu.
	 *
	 * @return {Object} groups
	 *
	 */
	getContextMenuGroups() {
		var groups = BaseElementView.prototype.getContextMenuGroups.apply( this, arguments ),
			transferGroupClipboardIndex = groups.indexOf( _.findWhere( groups, { name: 'clipboard' } ) ),
			transferGroupGeneralIndex = groups.indexOf( _.findWhere( groups, { name: 'general' } ) );

		groups.splice( transferGroupClipboardIndex + 1, 0, {
			name: 'save',
			actions: [
				{
					name: 'save',
					title: __( 'Save as Template', 'elementor' ),
					callback: this.saveAsTemplate.bind( this ),
				},
			],
		} );

		groups.splice( transferGroupGeneralIndex + 1, 0, {
			name: 'newContainerGroup',
			actions: [
				{
					name: 'newContainer',
					icon: 'eicon-plus',
					title: __( 'Add New Container', 'elementor' ),
					callback: this.addNewContainer.bind( this ),
				},
			],
		} );

		return groups;
	},

	isDroppingAllowed() {
		// Don't allow dragging items to document which is not editable.
		if ( ! this.getContainer().isEditable() ) {
			return false;
		}

		const elementView =
			elementor.channels.panelElements.request( 'element:selected' ) ||
			elementor.channels.editor.request( 'element:dragged' );

		if ( ! elementView ) {
			return false;
		}

		return [ 'widget', 'container' ].includes( elementView.model.get( 'elType' ) );
	},

	/**
	 * Determine if the current container is a nested container.
	 *
	 * @return {boolean} is a nested container
	 */
	isNested() {
		return 'document' !== this.getContainer().parent.model.get( 'elType' );
	},

	getEditButtons() {
		const elementData = elementor.getElementData( this.model ),
			editTools = {};

		editTools.add = {
			/* Translators: %s: Element Name. */
			title: sprintf( __( 'Add %s', 'elementor' ), elementData.title ),
			icon: 'plus',
		};

		editTools.edit = {
			/* Translators: %s: Element Name. */
			title: sprintf( __( 'Edit %s', 'elementor' ), elementData.title ),
			icon: 'handle',
		};

		if ( ! this.getContainer().isLocked() ) {
			if ( elementor.getPreferences( 'edit_buttons' ) ) {
				editTools.duplicate = {
					/* Translators: %s: Element Name. */
					title: sprintf( __( 'Duplicate %s', 'elementor' ), elementData.title ),
					icon: 'clone',
				};
			}

			editTools.remove = {
				/* Translators: %s: Element Name. */
				title: sprintf( __( 'Delete %s', 'elementor' ), elementData.title ),
				icon: 'close',
			};
		}

		return editTools;
	},

	/**
	 * Toggle the `New Section` view when clicking the `add` button in the edit tools.
	 *
	 * @return {void}
	 *
	 */
	onAddButtonClick() {
		if ( this.addSectionView && ! this.addSectionView.isDestroyed ) {
			this.addSectionView.fadeToDeath();

			return;
		}

		const addSectionView = new AddSectionView( {
			at: this.model.collection.indexOf( this.model ),
		} );

		addSectionView.render();

		this.$el.before( addSectionView.$el );

		addSectionView.$el.hide();

		// Delaying the slide down for slow-render browsers (such as FF)
		setTimeout( function() {
			addSectionView.$el.slideDown( null, function() {
				// Remove inline style, for preview mode.
				jQuery( this ).css( 'display', '' );
			} );
		} );

		this.addSectionView = addSectionView;
	},

	onRender() {
		BaseElementView.prototype.onRender.apply( this, arguments );

		// Defer to wait for everything to render.
		setTimeout( () => {
			this.nestingLevel = this.getNestingLevel();
			this.$el[ 0 ].dataset.nestingLevel = this.nestingLevel;

			// Add the EmptyView to the end of the Grid Container on initial page load if there are already some widgets.
			if ( this.isGridContainer() ) {
				this.reInitEmptyView();
			}

			this.droppableInitialize( this.container.settings );
		} );
	},

	onRenderEmpty() {
		this.$el.addClass( 'e-empty' );
	},

	onAddChild() {
		this.$el.removeClass( 'e-empty' );

		if ( this.isGridContainer() ) {
			this.handleGridEmptyView();
		}
	},

	renderOnChange( settings ) {
		BaseElementView.prototype.renderOnChange.apply( this, arguments );

		if ( settings.changed.flex_direction || settings.changed.content_width || settings.changed.grid_auto_flow || settings.changed.container_type ) {
			if ( this.isGridContainer() ) {
				this.reInitEmptyView();
			}

			// Make sure the Empty view is removed if we changed from grid to flex and there were widgets.
			if ( this.isFlexContainer() && ! this.isEmpty() ) {
				this.getCorrectContainerElement().find( '> .elementor-empty-view' ).remove();
			}

			this.droppableDestroy();
			this.droppableInitialize( settings );
		}
	},

	onDragStart() {
		this.droppableDestroy();
	},

	onDragEnd() {
		this.droppableInitialize( this.container.settings );
	},

	// TODO: Copied from `views/column.js`.
	attachElContent() {
		BaseElementView.prototype.attachElContent.apply( this, arguments );

		const $tooltip = jQuery( '<div>', {
			class: 'elementor-column-percents-tooltip',
			'data-side': elementorCommon.config.isRTL ? 'right' : 'left',
		} );

		this.$el.children( '.elementor-element-overlay' ).append( $tooltip );
	},

	// TODO: Copied from `views/column.js`.
	getPercentSize( size ) {
		if ( ! size ) {
			size = this.el.getBoundingClientRect().width;
		}

		return +( size / this.$el.parent().width() * 100 ).toFixed( 3 );
	},

	// TODO: Copied from `views/column.js`.
	getPercentsForDisplay() {
		const width = +this.model.getSetting( 'width' ) || this.getPercentSize();

		return width.toFixed( 1 ) + '%';
	},

	onResizeStart() {
		if ( this.ui.percentsTooltip ) {
			this.ui.percentsTooltip.show();
		}
	},

	onResize() {
		// TODO: Copied from `views/column.js`.
		if ( this.ui.percentsTooltip ) {
			this.ui.percentsTooltip.text( this.getPercentsForDisplay() );
		}
	},

	onResizeStop() {
		if ( this.ui.percentsTooltip ) {
			this.ui.percentsTooltip.hide();
		}
	},

	droppableDestroy() {
		this.$el.html5Droppable( 'destroy' );
		this.$el.find( '> .e-con-inner' ).html5Droppable( 'destroy' );
	},

	droppableInitialize( settings ) {
		if ( 'boxed' === settings.get( 'content_width' ) ) {
			this.$el.find( '> .e-con-inner' ).html5Droppable( this.getDroppableOptions() );
		} else {
			this.$el.html5Droppable( this.getDroppableOptions() );
		}
	},

	handleGridEmptyView() {
		const currentContainer = this.getCorrectContainerElement();

		this.moveElementToLastChild(
			currentContainer,
			currentContainer.find( '> .elementor-empty-view' ),
		);
	},

	moveElementToLastChild( parentWrapperElement, childElementToMove ) {
		let parent = parentWrapperElement.get( 0 ),
			child = childElementToMove.get( 0 );

		if ( ! parent || ! child ) {
			return;
		}

		if ( parent.lastChild === child ) {
			return;
		}

		parent.appendChild( child );
	},

	getCorrectContainerElement() {
		return this.isBoxedWidth()
			? this.$el.find( '> .e-con-inner' )
			: this.$el;
	},

	shouldIncrementIndex( side ) {
		if ( ! this.draggingOnBottomOrRightSide( side ) ) {
			return false;
		}

		return ! ( this.isGridContainer() && this.emptyViewIsCurrentlyBeingDraggedOver() );
	},

	draggingOnBottomOrRightSide( side ) {
		return [ 'bottom', 'right' ].includes( side );
	},

	isGridContainer() {
		return 'grid' === this.getContainer().settings.get( 'container_type' );
	},

	isFlexContainer() {
		return 'flex' === this.getContainer().settings.get( 'container_type' );
	},

	isBoxedWidth() {
		return 'boxed' === this.getContainer().settings.get( 'content_width' );
	},

	emptyViewIsCurrentlyBeingDraggedOver() {
		return this.getCorrectContainerElement().find( '> .elementor-empty-view > .elementor-first-add.elementor-html5dnd-current-element' ).length > 0;
	},

	reInitEmptyView() {
		if ( ! this.getCorrectContainerElement().find( '> .elementor-empty-view' ).length ) {
			delete this._showingEmptyView; // Marionette property that needs to be falsy for showEmptyView() to fully execute.
			this.showEmptyView(); // Marionette function.
			this.handleGridEmptyView();
		}
	},
} );

module.exports = ContainerView;
