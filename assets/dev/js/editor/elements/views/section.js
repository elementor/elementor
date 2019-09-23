var BaseElementView = require( 'elementor-elements/views/base' ),
	SectionView;

import AddSectionView from '../../views/add-section/inline';

SectionView = BaseElementView.extend( {
	defaultInnerSectionColumns: 2,
	defaultMinColumnSize: 2,

	childViewContainer: '> .elementor-container > .elementor-row',

	errors: {
		columnWidthTooLarge: 'New column width is too large',
		columnWidthTooSmall: 'New column width is too small',
	},

	template: Marionette.TemplateCache.get( '#tmpl-elementor-section-content' ),

	addSectionView: null,

	_checkIsFull: function() {
		this.$el.toggleClass( 'elementor-section-filled', this.isCollectionFilled() );
	},

	className: function() {
		var classes = BaseElementView.prototype.className.apply( this, arguments ),
			type = this.isInner() ? 'inner' : 'top';

		return classes + ' elementor-section elementor-' + type + '-section';
	},

	tagName: function() {
		return this.model.getSetting( 'html_tag' ) || 'section';
	},

	behaviors: function() {
		var behaviors = BaseElementView.prototype.behaviors.apply( this, arguments );

		_.extend( behaviors, {
			Sortable: {
				behaviorClass: require( 'elementor-behaviors/sortable' ),
				elChildType: 'column',
			},
		} );

		return elementor.hooks.applyFilters( 'elements/section/behaviors', behaviors, this );
	},

	initialize: function() {
		BaseElementView.prototype.initialize.apply( this, arguments );

		this.listenTo( this.collection, 'add remove reset', this._checkIsFull );
	},

	addChildModel: function( model ) {
		var isModelInstance = model instanceof Backbone.Model,
			isInner = this.isInner();

		if ( isModelInstance ) {
			// TODO: change to command.
			model.set( 'isInner', isInner );
		} else {
			model.isInner = isInner;
		}

		return BaseElementView.prototype.addChildModel.apply( this, arguments );
	},

	getEditButtons: function() {
		const elementData = elementor.getElementData( this.model ),
			editTools = {};

		if ( ! this.isInner() ) {
			editTools.add = {
				title: elementor.translate( 'add_element', [ elementData.title ] ),
				icon: 'plus',
			};
		}

		editTools.edit = {
			title: elementor.translate( 'edit_element', [ elementData.title ] ),
			icon: 'handle',
		};

		if ( elementor.config.editButtons ) {
			editTools.duplicate = {
				title: elementor.translate( 'duplicate_element', [ elementData.title ] ),
				icon: 'clone',
			};
		}

		editTools.remove = {
			title: elementor.translate( 'delete_element', [ elementData.title ] ),
			icon: 'close',
		};

		return editTools;
	},

	getContextMenuGroups: function() {
		var groups = BaseElementView.prototype.getContextMenuGroups.apply( this, arguments ),
			transferGroupIndex = groups.indexOf( _.findWhere( groups, { name: 'transfer' } ) );

		groups.splice( transferGroupIndex + 1, 0, {
			name: 'save',
			actions: [
				{
					name: 'save',
					title: elementor.translate( 'save_as_block' ),
					callback: this.save.bind( this ),
				},
			],
		} );

		return groups;
	},

	getSortableOptions: function() {
		var sectionConnectClass = this.isInner() ? '.elementor-inner-section' : '.elementor-top-section';

		return {
			connectWith: sectionConnectClass + ' > .elementor-container > .elementor-row',
			handle: '> .elementor-element-overlay .elementor-editor-element-edit',
			items: '> .elementor-column',
			forcePlaceholderSize: true,
			tolerance: 'pointer',
		};
	},

	getColumnPercentSize: function( element, size ) {
		return +( size / element.parent().width() * 100 ).toFixed( 3 );
	},

	getDefaultStructure: function() {
		return this.collection.length + '0';
	},

	getStructure: function() {
		return this.model.getSetting( 'structure' );
	},

	getColumnAt: function( index ) {
		var model = this.collection.at( index );

		return model ? this.children.findByModelCid( model.cid ) : null;
	},

	getNextColumn: function( columnView ) {
		return this.getColumnAt( this.collection.indexOf( columnView.model ) + 1 );
	},

	getPreviousColumn: function( columnView ) {
		return this.getColumnAt( this.collection.indexOf( columnView.model ) - 1 );
	},

	setStructure: function( structure ) {
		const parsedStructure = elementor.presetsFactory.getParsedStructure( structure );

		if ( +parsedStructure.columnsCount !== this.collection.length ) {
			throw new TypeError( 'The provided structure doesn\'t match the columns count.' );
		}

		$e.run( 'document/elements/settings', {
			container: this.getContainer(),
			settings: { structure },
			options: { external: true },
		} );

		this.adjustColumns();
	},

	adjustColumns: function() {
		const preset = elementor.presetsFactory.getPresetByStructure( this.getStructure() );

		this.children.each( ( columnView, index ) => {
			const container = columnView.getContainer();

			$e.run( 'document/elements/settings', {
				container,
				settings: {
					_column_size: preset.preset[ index ],
					_inline_size: null,
				},
			} );
		} );
	},

	resetLayout: function() {
		this.setStructure( this.getDefaultStructure() );
	},

	resetColumnsCustomSize: function() {
		this.children.each( ( columnView ) => {
			$e.run( 'document/elements/settings', {
				container: columnView.getContainer(),
				settings: {
					_inline_size: null,
				},
				options: {
					external: true,
					debounceHistory: true,
				},
			} );
		} );
	},

	handleEmptySection: function() {
		$e.run( 'document/elements/create', {
			container: this.getContainer(),
			model: {
				elType: 'column',
			},
		} );
	},

	handleCreateInnerSection: function() {
		for ( let i = 0; i < this.defaultInnerSectionColumns; ++i ) {
			this.addChildElement();
		}

		// TODO: maybe we need `history false` flag since it does not need to restore it.
		this.setStructure( this.defaultInnerSectionColumns + '0' );
	},

	isCollectionFilled: function() {
		var MAX_SIZE = 10,
			columnsCount = this.collection.length;

		return ( MAX_SIZE <= columnsCount );
	},

	showChildrenPercentsTooltip: function( columnView, nextColumnView ) {
		columnView.ui.percentsTooltip.show();

		columnView.ui.percentsTooltip.attr( 'data-side', elementorCommon.config.isRTL ? 'right' : 'left' );

		nextColumnView.ui.percentsTooltip.show();

		nextColumnView.ui.percentsTooltip.attr( 'data-side', elementorCommon.config.isRTL ? 'left' : 'right' );
	},

	hideChildrenPercentsTooltip: function( columnView, nextColumnView ) {
		columnView.ui.percentsTooltip.hide();

		nextColumnView.ui.percentsTooltip.hide();
	},

	resizeColumn: function( childView, currentSize, newSize, resizeSource = true, debounceHistory = true ) {
		const nextChildView = this.getNextColumn( childView ) || this.getPreviousColumn( childView );

		if ( ! nextChildView ) {
			throw new ReferenceError( 'There is not any next column' );
		}

		const $nextElement = nextChildView.$el,
			nextElementCurrentSize = +nextChildView.model.getSetting( '_inline_size' ) || this.getColumnPercentSize( $nextElement, $nextElement[ 0 ].getBoundingClientRect().width ),
			nextElementNewSize = +( currentSize + nextElementCurrentSize - newSize ).toFixed( 3 );

		if ( nextElementNewSize < this.defaultMinColumnSize ) {
			throw new RangeError( this.errors.columnWidthTooLarge );
		}

		if ( newSize < this.defaultMinColumnSize ) {
			throw new RangeError( this.errors.columnWidthTooSmall );
		}

		const currentColumnContainer = childView.getContainer(),
			nextColumnContainer = nextChildView.getContainer(),
			containers = [ nextColumnContainer ],
			settings = {
				[ nextColumnContainer.id ]: {
					_inline_size: nextElementNewSize,
				},
			};

		if ( resizeSource ) {
			containers.push( currentColumnContainer );
			settings[ currentColumnContainer.id ] = {
				_inline_size: newSize,
			};
		}

		$e.run( 'document/elements/settings', {
			// `nextColumn` must be first.
			containers,
			settings,
			isMultiSettings: true,
			options: {
				debounceHistory,
				external: true,
				history: {
					elementType: 'column',
					title: elementor.config.elements.column.controls._inline_size.label,
				},
			},
		} );
	},

	destroyAddSectionView: function() {
		if ( this.addSectionView && ! this.addSectionView.isDestroyed ) {
			this.addSectionView.destroy();
		}
	},

	onRender: function() {
		BaseElementView.prototype.onRender.apply( this, arguments );

		this._checkIsFull();
	},

	onAddButtonClick: function() {
		if ( this.addSectionView && ! this.addSectionView.isDestroyed ) {
			this.addSectionView.fadeToDeath();

			return;
		}

		var myIndex = this.model.collection.indexOf( this.model ),
			addSectionView = new AddSectionView( {
				at: myIndex,
			} );

		addSectionView.render();

		this.$el.before( addSectionView.$el );

		addSectionView.$el.hide();

		// Delaying the slide down for slow-render browsers (such as FF)
		setTimeout( function() {
			addSectionView.$el.slideDown();
		} );

		this.addSectionView = addSectionView;
	},

	onChildviewRequestResizeStart: function( columnView ) {
		var nextColumnView = this.getNextColumn( columnView );

		if ( ! nextColumnView ) {
			return;
		}

		this.showChildrenPercentsTooltip( columnView, nextColumnView );

		var $iframes = columnView.$el.find( 'iframe' ).add( nextColumnView.$el.find( 'iframe' ) );

		elementor.helpers.disableElementEvents( $iframes );
	},

	onChildviewRequestResizeStop: function( columnView ) {
		var nextColumnView = this.getNextColumn( columnView );

		if ( ! nextColumnView ) {
			return;
		}

		this.hideChildrenPercentsTooltip( columnView, nextColumnView );

		var $iframes = columnView.$el.find( 'iframe' ).add( nextColumnView.$el.find( 'iframe' ) );

		elementor.helpers.enableElementEvents( $iframes );
	},

	onChildviewRequestResize: function( columnView, ui ) {
		ui.element.css( {
			width: '',
			left: 'initial', // Fix for RTL resizing
		} );

		$e.run( 'document/elements/settings', {
			container: columnView.getContainer(),
			settings: {
				_inline_size: this.getColumnPercentSize( ui.element, ui.size.width ),
			},
			options: {
				debounceHistory: true,
			},
		} );
	},

	onDestroy: function() {
		BaseElementView.prototype.onDestroy.apply( this, arguments );

		this.destroyAddSectionView();
	},
} );

module.exports = SectionView;
