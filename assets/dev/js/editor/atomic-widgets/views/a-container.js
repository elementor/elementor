import AEmptyView from './container/a-empty-view';
import WidgetResizable from "../../elements/views/behaviors/widget-resizeable";
import ContainerHelper from 'elementor-editor-utils/container-helper';

const BaseElementView = require( 'elementor-elements/views/base' );
const AContainerView = BaseElementView.extend( {
	template: Marionette.TemplateCache.get( '#tmpl-elementor-a-container-content' ),

	emptyView: AEmptyView,

	tagName() {
		return this.model.getSetting( 'tag' ) || 'div';
	},

	getChildViewContainer() {
		this.childViewContainer = '';

		return Marionette.CompositeView.prototype.getChildViewContainer.apply( this, arguments );
	},

	className() {
		return `${ BaseElementView.prototype.className.apply( this ) } e-con a-con`;
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

	renderOnChange( settings ) {
		BaseElementView.prototype.renderOnChange.apply( this, arguments );

		const classes = this.getContainer().settings.get( 'classes' );
		if ( classes && classes.value && classes.value[ 0 ] ) {
			this.$el.addClass( classes.value[ 0 ] );
		}
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

	filterSettings( newItem ) {
		if ( 'container' !== newItem?.elType ) {
			return;
		}

		const parentContainer = this;

		if ( parentContainer.isBoxedWidth() ) {
			newItem.settings.content_width = 'full';
		} else if ( 0 !== parentContainer.getNestingLevel() ) {
			newItem.settings.content_width = 'full';
		}
	},

	childViewOptions() {
		return {
			emptyViewOwner: this,
		};
	},

	getCurrentUiStates() {
		const currentDeviceMode = elementor.channels.deviceMode.request( 'currentMode' ),
			deviceSuffix = 'desktop' === currentDeviceMode ? '' : '_' + currentDeviceMode,
			directionSettingKey = this.getDirectionSettingKey() + deviceSuffix,
			currentDirection = this.container.settings.get( directionSettingKey );

		return {
			directionMode: currentDirection || ContainerHelper.DIRECTION_DEFAULT,
		};
	},

	onDeviceModeChange() {
		SetDirectionMode.set( this.getContainer() );
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

	onDestroy() {
		BaseElementView.prototype.onDestroy.apply( this, arguments );

		elementor.stopListening( elementor.channels.deviceMode, 'change', this.onDeviceModeChange );
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

	isBoxedWidth() {
		return 'boxed' === this.getContainer().settings.get( 'content_width' );
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

	emptyViewIsCurrentlyBeingDraggedOver() {
		return this.getCorrectContainerElement().find( '> .elementor-empty-view > .elementor-first-add.elementor-html5dnd-current-element' ).length > 0;
	},

	getCorrectContainerElement() {
		return this.isBoxedWidth()
			? this.$el.find( '> .e-con-inner' )
			: this.$el;
	},

} );

module.exports = AContainerView;
