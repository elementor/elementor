import DivBlockEmptyView from './container/div-block-empty-view';

const BaseElementView = elementor.modules.elements.views.BaseElement;
const DivBlockView = BaseElementView.extend( {
	template: Marionette.TemplateCache.get( '#tmpl-elementor-div-block-content' ),

	emptyView: DivBlockEmptyView,

	tagName() {
		return this.model.getSetting( 'tag' ) || 'div';
	},

	getChildViewContainer() {
		this.childViewContainer = '';

		return Marionette.CompositeView.prototype.getChildViewContainer.apply( this, arguments );
	},

	className() {
		return `${ BaseElementView.prototype.className.apply( this ) } e-con e-div-block${ this.getClassString() }`;
	},

	// TODO: Copied from `views/column.js`.
	ui() {
		var ui = BaseElementView.prototype.ui.apply( this, arguments );

		ui.percentsTooltip = '> .elementor-element-overlay .elementor-column-percents-tooltip';

		return ui;
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

	renderOnChange() {
		BaseElementView.prototype.renderOnChange.apply( this, arguments );
		this.$el.addClass( this.getClasses() );
	},

	onRender() {
		BaseElementView.prototype.onRender.apply( this, arguments );

		// Defer to wait for everything to render.
		setTimeout( () => {
			this.droppableInitialize();
		} );
	},

	droppableInitialize() {
		this.$el.html5Droppable( this.getDroppableOptions() );
	},

	isDroppingAllowed() {
		return true;
	},

	behaviors() {
		const behaviors = BaseElementView.prototype.behaviors.apply( this, arguments );

		_.extend( behaviors, {
			Sortable: {
				behaviorClass: require( 'elementor-behaviors/sortable' ),
				elChildType: 'widget',
			},
		} );

		return elementor.hooks.applyFilters( 'elements/div-block/behaviors', behaviors, this );
	},

	/**
	 * @return {{}} options
	 */
	getSortableOptions() {
		return {
			preventInit: true,
		};
	},

	getDroppableAxis() {
		if ( this.isHorizontalAxis() ) {
			return 'horizontal';
		}

		return 'vertical';
	},

	isHorizontalAxis() {
		const styles = window.getComputedStyle( this.$el[ 0 ] );

		return 'flex' === styles.display &&
			[ 'row', 'row-reverse' ].includes( styles.flexDirection );
	},

	getDroppableOptions() {
		const items = '> .elementor-element, > .elementor-empty-view .elementor-first-add';
		let $placeholder;

		return {
			axis: this.getDroppableAxis(),
			items,
			groups: [ 'elementor-element' ],
			horizontalThreshold: 5,
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
					containerSelector = event.currentTarget.parentElement;

				let $elements = jQuery( containerSelector ).find( '> .elementor-element' );

				// Exclude the dragged element from the indexing calculations.
				if ( draggingInSameParent ) {
					$elements = $elements.not( draggedView.$el );
				}

				const widgetsArray = Object.values( $elements );

				let newIndex = widgetsArray.indexOf( event.currentTarget );

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
			onDragging: ( side, event ) => {
				if ( ! $placeholder ) {
					$placeholder = this.$el.find( '.elementor-sortable-placeholder' );
				}

				if ( ! $placeholder.length ) {
					return;
				}

				const currentTarget = event.currentTarget,
					currentTargetHeight = currentTarget.getBoundingClientRect().height,
					placeholderElement = $placeholder[ 0 ],
					isNotBeforeSibling = currentTarget !== placeholderElement.previousElementSibling;

				if ( 'horizontal' === this.getDroppableAxis() ) {
					if ( isNotBeforeSibling ) {
						this.handleDropSide( side, placeholderElement, currentTarget );
					}

					this.maybeShowCustomDropPlaceholder( $placeholder, currentTargetHeight );
				} else {
					$placeholder.removeAttr( 'style' );
				}
			},
		};
	},

	handleDropSide( side, placeholderElement, currentTarget ) {
		const insertMethod = [ 'top', 'left' ].includes( side ) ? 'before' : 'after';
		currentTarget[ insertMethod ]( placeholderElement );
	},

	maybeShowCustomDropPlaceholder( $placeholder, currentTargetHeight ) {
		if ( $placeholder.css( 'height' ) !== `${ currentTargetHeight }px` ) {
			$placeholder.css( {
				display: 'block',
				height: `${ currentTargetHeight }px`,
				'background-color': '#eb8efb',
				width: '10px',
			} );
		}
	},

	getEditButtons() {
		const elementData = elementor.getElementData( this.model ),
			editTools = {};

		if ( $e.components.get( 'document/elements' ).utils.allowAddingWidgets() ) {
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
		}

		if ( ! this.getContainer().isLocked() ) {
			if ( elementor.getPreferences( 'edit_buttons' ) && $e.components.get( 'document/elements' ).utils.allowAddingWidgets() ) {
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

	shouldIncrementIndex( side ) {
		if ( ! this.draggingOnBottomOrRightSide( side ) ) {
			return false;
		}

		return ! this.emptyViewIsCurrentlyBeingDraggedOver();
	},

	draggingOnBottomOrRightSide( side ) {
		return [ 'bottom', 'right' ].includes( side );
	},

	emptyViewIsCurrentlyBeingDraggedOver() {
		return this.$el.find( '> .elementor-empty-view > .elementor-first-add.elementor-html5dnd-current-element' ).length > 0;
	},

	/**
	 * Toggle the `New Section` view when clicking the `add` button in the edit tools.
	 *
	 * @return {void}
	 */
	onAddButtonClick() {
		if ( this.addSectionView && ! this.addSectionView.isDestroyed ) {
			this.addSectionView.fadeToDeath();

			return;
		}

		const addSectionView = new elementor.modules.elements.components.AddSectionView( {
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

	getClasses() {
		return this.options?.model?.getSetting( 'classes' )?.value || [];
	},

	getClassString() {
		const classes = this.getClasses();

		return classes.length ? [ '', ...classes ].join( ' ' ) : '';
	},
} );

module.exports = DivBlockView;
