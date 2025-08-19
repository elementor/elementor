import { DEFAULT_MAX_COLUMNS } from 'elementor-elements/views/section';

var BaseElementView = require( 'elementor-elements/views/base' ),
	ColumnEmptyView = require( 'elementor-elements/views/column-empty' ),
	ColumnView;

ColumnView = BaseElementView.extend( {
	template: Marionette.TemplateCache.get( '#tmpl-elementor-column-content' ),

	emptyView: ColumnEmptyView,

	childViewContainer: '> .elementor-widget-wrap',

	toggleEditTools: true,

	behaviors() {
		var behaviors = BaseElementView.prototype.behaviors.apply( this, arguments );

		_.extend( behaviors, {
			Sortable: {
				behaviorClass: require( 'elementor-behaviors/sortable' ),
				elChildType: 'widget',
			},
			Resizable: {
				behaviorClass: require( 'elementor-behaviors/column-resizable' ),
			},
		} );

		return elementor.hooks.applyFilters( 'elements/column/behaviors', behaviors, this );
	},

	className() {
		var classes = BaseElementView.prototype.className.apply( this, arguments ),
			type = this.isInner() ? 'inner' : 'top';

		return classes + ' elementor-column elementor-' + type + '-column';
	},

	tagName() {
		return this.model.getSetting( 'html_tag' ) || 'div';
	},

	ui() {
		var ui = BaseElementView.prototype.ui.apply( this, arguments );

		ui.columnInner = '> .elementor-widget-wrap';

		ui.percentsTooltip = '> .elementor-element-overlay .elementor-column-percents-tooltip';

		return ui;
	},

	getEditButtons() {
		const elementData = elementor.getElementData( this.model ),
			editTools = {};

		editTools.edit = {
			/* Translators: %s: Element name. */
			title: sprintf( __( 'Edit %s', 'elementor' ), elementData.title ),
			icon: 'column',
		};

		if ( elementor.getPreferences( 'edit_buttons' ) ) {
			editTools.duplicate = {
				/* Translators: %s: Element name. */
				title: sprintf( __( 'Duplicate %s', 'elementor' ), elementData.title ),
				icon: 'clone',
			};

			editTools.add = {
				/* Translators: %s: Element name. */
				title: sprintf( __( 'Add %s', 'elementor' ), elementData.title ),
				icon: 'plus',
			};
		}

		return editTools;
	},

	initialize() {
		BaseElementView.prototype.initialize.apply( this, arguments );

		this.model.get( 'editSettings' ).set( 'defaultEditRoute', 'layout' );
	},

	attachElContent() {
		BaseElementView.prototype.attachElContent.apply( this, arguments );

		const $tooltip = jQuery( '<div>', { class: 'elementor-column-percents-tooltip' } );

		this.$el.children( '.elementor-element-overlay' ).append( $tooltip );
	},

	getContextMenuGroups() {
		const self = this,
			groups = BaseElementView.prototype.getContextMenuGroups.apply( this, arguments ),
			generalGroupIndex = groups.indexOf( _.findWhere( groups, { name: 'general' } ) );

		groups.splice( generalGroupIndex + 1, 0, {
			name: 'addNew',
			actions: [
				{
					name: 'addNew',
					icon: 'eicon-plus',
					title: __( 'Add New Column', 'elementor' ),
					callback: this.addNewColumn.bind( this ),
					isEnabled: () => self.model.collection.length < DEFAULT_MAX_COLUMNS && ! elementor.selection.isMultiple(),
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

		var elementView = elementor.channels.panelElements.request( 'element:selected' );

		if ( ! elementView ) {
			return false;
		}

		var elType = elementView.model.get( 'elType' );

		if ( 'container' === elType ) {
			return true;
		}

		if ( 'section' === elType ) {
			return ! this.isInner();
		}

		return 'widget' === elType;
	},

	getPercentsForDisplay() {
		const inlineSize = +this.model.getSetting( '_inline_size' ) || this.getPercentSize();

		return inlineSize.toFixed( 1 ) + '%';
	},

	changeSizeUI() {
		const self = this,
			columnSize = self.model.getSetting( '_column_size' );

		self.$el.attr( 'data-col', columnSize );

		_.defer( function() { // Wait for the column size to be applied
			if ( self.ui.percentsTooltip ) {
				self.ui.percentsTooltip.text( self.getPercentsForDisplay() );
			}
		} );
	},

	getPercentSize( size ) {
		if ( ! size ) {
			size = this.el.getBoundingClientRect().width;
		}

		return +( size / this.$el.parent().width() * 100 ).toFixed( 3 );
	},

	getSortableOptions() {
		return {
			connectWith: '.elementor-widget-wrap',
			items: '> .elementor-element',
		};
	},

	changeChildContainerClasses() {
		const emptyClass = 'elementor-element-empty',
			populatedClass = 'elementor-element-populated';

		if ( this.ui.columnInner ) {
			if ( this.collection.isEmpty() ) {
				this.ui.columnInner.removeClass( populatedClass ).addClass( emptyClass );
			} else {
				this.ui.columnInner.removeClass( emptyClass ).addClass( populatedClass );
			}
		}
	},

	addNewColumn() {
		$e.run( 'document/elements/create', {
			model: {
				elType: 'column',
			},
			container: this.getContainer().parent,
			options: {
				at: this.$el.index() + 1,
			},
		} );
	},

	onRender() {
		const getDropIndex = ( side, event ) => {
			let newIndex = jQuery( event.currentTarget ).index();

			if ( 'top' === side ) {
				newIndex--;
			}

			return newIndex;
		};

		BaseElementView.prototype.onRender.apply( this, arguments );

		this.changeChildContainerClasses();

		this.changeSizeUI();

		this.$el.html5Droppable( {
			items: ' > .elementor-widget-wrap > .elementor-element, >.elementor-widget-wrap > .elementor-empty-view > .elementor-first-add',
			axis: [ 'vertical' ],
			groups: [ 'elementor-element' ],
			isDroppingAllowed: this.isDroppingAllowed.bind( this ),
			currentElementClass: 'elementor-html5dnd-current-element',
			placeholderClass: 'elementor-sortable-placeholder elementor-widget-placeholder',
			hasDraggingOnChildClass: 'elementor-dragging-on-child',
			onDropping: ( side, event ) => {
				// Triggering drag end manually, since it won't fired above iframe
				elementor.getPreviewView().onPanelElementDragEnd();

				this.onDrop(
					event,
					{ side, at: getDropIndex( side, event ) },
				);
			},
		} );
	},

	onAddButtonClick( event ) {
		event.stopPropagation();

		this.addNewColumn();
	},
} );

module.exports = ColumnView;
