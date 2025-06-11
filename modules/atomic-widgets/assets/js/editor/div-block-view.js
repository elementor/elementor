import DivBlockEmptyView from './container/div-block-empty-view';
import { getAllElementTypes } from 'elementor-editor/utils/element-types';

const BaseElementView = elementor.modules.elements.views.BaseElement;
const DivBlockView = BaseElementView.extend( {
	template: Marionette.TemplateCache.get( '#tmpl-elementor-e-div-block-content' ),

	emptyView: DivBlockEmptyView,

	tagName() {
		if ( this.haveLink() ) {
			return 'a';
		}

		const tagControl = this.model.getSetting( 'tag' );
		const tagControlValue = tagControl?.value || tagControl;

		return tagControlValue || 'div';
	},

	getChildViewContainer() {
		this.childViewContainer = '';

		return Marionette.CompositeView.prototype.getChildViewContainer.apply( this, arguments );
	},

	className() {
		return `${ BaseElementView.prototype.className.apply( this ) } e-con ${ this.getClassString() }`;
	},

	// TODO: Copied from `views/column.js`.
	ui() {
		var ui = BaseElementView.prototype.ui.apply( this, arguments );

		ui.percentsTooltip = '> .elementor-element-overlay .elementor-column-percents-tooltip';

		return ui;
	},

	attributes() {
		const attr = BaseElementView.prototype.attributes.apply( this );
		const local = {};
		const cssId = this.model.getSetting( '_cssid' );

		if ( cssId ) {
			local.id = cssId.value;
		}

		const href = this.getHref();

		if ( href ) {
			local.href = href;
		}

		return {
			...attr,
			...local,
		};
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

	renderOnChange( settings ) {
		const changed = settings.changedAttributes();

		setTimeout( () => {
			this.updateHandlesOverlay();
		} );

		if ( ! changed ) {
			return;
		}

		BaseElementView.prototype.renderOnChange.apply( this, settings );

		if ( changed.classes ) {
			// Rebuild the whole class attribute to remove previous outdated classes
			this.$el.attr( 'class', this.className() );

			return;
		}

		if ( changed._cssid ) {
			if ( changed._cssid.value ) {
				this.$el.attr( 'id', changed._cssid.value );
			} else {
				this.$el.removeAttr( 'id' );
			}

			return;
		}

		this.$el.addClass( this.getClasses() );

		if ( this.isTagChanged( changed ) ) {
			this.rerenderEntireView();
		}
	},

	isTagChanged( changed ) {
		return ( changed?.tag !== undefined || changed?.link !== undefined ) && this._parent && this.tagName() !== this.el.tagName;
	},

	rerenderEntireView() {
		const parent = this._parent;
		this._parent.removeChildView( this );
		parent.addChild( this.model, DivBlockView, this._index );
	},

	onRender() {
		BaseElementView.prototype.onRender.apply( this, arguments );

		// Defer to wait for everything to render.
		setTimeout( () => {
			this.droppableInitialize();
			this.updateHandlesOverlay();
		} );
	},

	haveLink() {
		return !! this.model.getSetting( 'link' )?.value?.destination?.value;
	},

	getHref() {
		if ( ! this.haveLink() ) {
			return;
		}

		const { $$type, value } = this.model.getSetting( 'link' ).value.destination;
		const isPostId = 'number' === $$type;
		const hrefPrefix = isPostId ? elementor.config.home_url + '/?p=' : '';

		return hrefPrefix + value;
	},

	droppableInitialize() {
		this.$el.html5Droppable( this.getDroppableOptions() );
	},

	/**
	 * Add a `Save as a Template` button to the context menu.
	 *
	 * @return {Object} groups
	 */
	getContextMenuGroups() {
		var groups = BaseElementView.prototype.getContextMenuGroups.apply( this, arguments ),
			transferGroupClipboardIndex = groups.indexOf( _.findWhere( groups, { name: 'clipboard' } ) );

		groups.splice( transferGroupClipboardIndex + 1, 0, {
			name: 'save',
			actions: [
				{
					name: 'save',
					title: __( 'Save as a template', 'elementor' ),
					shortcut: elementorCommon.config.experimentalFeatures?.[ 'cloud-library' ] ? `<span class="elementor-context-menu-list__item__shortcut__new-badge">${ __( 'New', 'elementor' ) }</span>` : '',
					callback: this.saveAsTemplate.bind( this ),
					isEnabled: () => ! this.getContainer().isLocked(),
				},
			],
		} );

		return groups;
	},

	saveAsTemplate() {
		$e.route( 'library/save-template', {
			model: this.model,
		} );
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

		return elementor.hooks.applyFilters( 'elements/e-div-block/behaviors', behaviors, this );
	},

	/**
	 * @return {{}} options
	 */
	getSortableOptions() {
		return {
			preventInit: true,
		};
	},

	getDroppableOptions() {
		const items = '> .elementor-element, > .elementor-empty-view .elementor-first-add';

		return {
			axis: null,
			items,
			groups: [ 'elementor-element' ],
			horizontalThreshold: 0,
			isDroppingAllowed: this.isDroppingAllowed.bind( this ),
			currentElementClass: 'elementor-html5dnd-current-element',
			placeholderClass: 'elementor-sortable-placeholder elementor-widget-placeholder',
			hasDraggingOnChildClass: 'e-dragging-over',
			getDropContainer: () => this.getContainer(),
			onDropping: ( side, event ) => {
				event.stopPropagation();

				// Triggering the drag end manually, since it won't fire above the iframe
				elementor.getPreviewView().onPanelElementDragEnd();

				const draggedView = elementor.channels.editor.request( 'element:dragged' ),
					draggedElement = draggedView?.getContainer().view.el,
					containerElement = event.currentTarget.parentElement,
					elements = Array.from( containerElement?.querySelectorAll( ':scope > .elementor-element' ) || [] ),
					targetIndex = elements.indexOf( event.currentTarget );

				if ( this.isPanelElement( draggedView, draggedElement ) ) {
					this.onDrop( event, { at: targetIndex } );

					return;
				}

				if ( this.isParentElement( draggedView.getContainer().id ) ) {
					return;
				}

				const selfIndex = elements.indexOf( draggedElement );

				if ( targetIndex === selfIndex ) {
					return;
				}

				const dropIndex = this.getDropIndex( containerElement, side, targetIndex, selfIndex );

				this.moveDroppedItem( draggedView, dropIndex );
			},
		};
	},

	isPanelElement( draggedView, draggedElement ) {
		return ! draggedView || ! draggedElement;
	},

	isParentElement( draggedId ) {
		let current = this.container;

		while ( current ) {
			if ( current.id === draggedId ) {
				return true;
			}

			current = current.parent;
		}

		return false;
	},

	getDropIndex( container, side, index, selfIndex ) {
		const styles = window.getComputedStyle( container );

		const isFlex = [ 'flex', 'inline-flex' ].includes( styles.display );
		const isFlexReverse = isFlex &&
			[ 'column-reverse', 'row-reverse' ].includes( styles.flexDirection );

		const isRow = isFlex && [ 'row-reverse', 'row' ].includes( styles.flexDirection );

		const isRtl = elementorCommon.config.isRTL;

		const isReverse = isRow ? isFlexReverse !== isRtl : isFlexReverse;

		// The element should be placed BEFORE the current target
		// if is reversed + side is bottom/right OR not is reversed + side is top/left
		if ( ( isReverse === this.draggingOnBottomOrRightSide( side ) ) ) {
			if ( -1 === selfIndex || selfIndex >= index - 1 ) {
				return index;
			}

			return index > 0 ? index - 1 : 0;
		}

		if ( 0 <= selfIndex && selfIndex < index ) {
			return index;
		}

		return index + 1;
	},

	moveDroppedItem( draggedView, dropIndex ) {
		// Reset the dragged element cache.
		elementor.channels.editor.reply( 'element:dragged', null );

		$e.run( 'document/elements/move', {
			container: draggedView.getContainer(),
			target: this.getContainer(),
			options: {
				at: dropIndex,
			},
		} );
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

	draggingOnBottomOrRightSide( side ) {
		return [ 'bottom', 'right' ].includes( side );
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
		const base = this.getBaseClass();

		return [ base, ...classes ].join( ' ' );
	},

	getBaseClass() {
		const baseStyles = elementor.helpers.getAtomicWidgetBaseStyles( this.options?.model );

		return Object.keys( baseStyles ?? {} )[ 0 ] ?? '';
	},

	isOverlayHidden() {
		const elementStyles = window.getComputedStyle( this.el )
		const overflowStyles = [ elementStyles.overflowX, elementStyles.overflowY, elementStyles.overflow ]
		
		return overflowStyles.includes( 'hidden' ) || overflowStyles.includes( 'auto' )
	},

	updateHandlesOverlay() {
		const elementType = this.$el.data( 'element_type' );
		const isElement = getAllElementTypes().includes( elementType );

		if ( ! isElement ) {
			return;
		}

		if ( this.isOverlayHidden() ) {
			this.$el.addClass( 'e-handles-inside' );
		} else {
			this.$el.removeClass( 'e-handles-inside' );
		};
	},
} );

module.exports = DivBlockView;
