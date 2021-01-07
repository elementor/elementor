import AddSectionView from '../../views/add-section/inline';

const BaseElementView = require( 'elementor-elements/views/base' );

const DEFAULT_INNER_SECTION_COLUMNS = 2,
	DEFAULT_MIN_COLUMN_SIZE = 2,
	DEFAULT_MAX_COLUMNS = 10;

const SectionView = BaseElementView.extend( {
	childViewContainer: function() {
		let containerSelector = '> .elementor-container';

		if ( ! elementorCommon.config.experimentalFeatures[ 'e_dom_optimization' ] ) {
			containerSelector += ' > .elementor-row';
		}

		return containerSelector;
	},

	template: Marionette.TemplateCache.get( '#tmpl-elementor-section-content' ),

	addSectionView: null,

	_checkIsFull: function() {
		this.toggleSectionIsFull();

		elementorCommon.helpers.softDeprecated( '_checkIsFull', '2.9.0',
			'toggleSectionIsFull()' );
	},

	toggleSectionIsFull: function() {
		this.$el.toggleClass( 'elementor-section-filled', this.isCollectionFilled() );
	},

	addChildModel: function( model ) {
		/// TODO: maybe should be part of $e.hooks.
		const isModelInstance = model instanceof Backbone.Model,
			isInner = this.isInner();

		if ( isModelInstance ) {
			// TODO: change to command.
			model.set( 'isInner', isInner );
		} else {
			model.isInner = isInner;
		}

		return BaseElementView.prototype.addChildModel.apply( this, arguments );
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

		this.model.get( 'editSettings' ).set( 'defaultEditRoute', 'layout' );
	},

	getEditButtons: function() {
		const elementData = elementor.getElementData( this.model ),
			editTools = {};

		if ( ! this.isInner() ) {
			editTools.add = {
				/* translators: %s: Element Name. */
				title: sprintf( __( 'Add %s', 'elementor' ), elementData.title ),
				icon: 'plus',
			};
		}

		editTools.edit = {
			/* translators: %s: Element Name. */
			title: sprintf( __( 'Edit %s', 'elementor' ), elementData.title ),
			icon: 'handle',
		};

		if ( elementor.getPreferences( 'edit_buttons' ) ) {
			editTools.duplicate = {
				/* translators: %s: Element Name. */
				title: sprintf( __( 'Duplicate %s', 'elementor' ), elementData.title ),
				icon: 'clone',
			};
		}

		editTools.remove = {
			/* translators: %s: Element Name. */
			title: sprintf( __( 'Delete %s', 'elementor' ), elementData.title ),
			icon: 'close',
		};

		return editTools;
	},

	getContextMenuGroups: function() {
		var groups = BaseElementView.prototype.getContextMenuGroups.apply( this, arguments ),
			transferGroupIndex = groups.indexOf( _.findWhere( groups, { name: 'clipboard' } ) );

		groups.splice( transferGroupIndex + 1, 0, {
			name: 'save',
			actions: [
				{
					name: 'save',
					title: __( 'Save as Template', 'elementor' ),
					callback: this.save.bind( this ),
				},
			],
		} );

		return groups;
	},

	getSortableOptions: function() {
		var sectionConnectClass = this.isInner() ? '.elementor-inner-section' : '.elementor-top-section';

		return {
			connectWith: sectionConnectClass + this.childViewContainer(),
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

	getNeighborContainer( container ) {
		const parentView = container.parent.view,
			nextView = parentView.getNextColumn( container.view ) || parentView.getPreviousColumn( container.view );

		if ( ! nextView ) {
			return false;
		}

		return nextView.getContainer();
	},

	setStructure: function( structure, shouldAdjustColumns = true ) {
		const parsedStructure = elementor.presetsFactory.getParsedStructure( structure );

		if ( +parsedStructure.columnsCount !== this.collection.length ) {
			throw new TypeError( 'The provided structure doesn\'t match the columns count.' );
		}

		$e.run( 'document/elements/settings', {
			container: this.getContainer(),
			settings: { structure },
			options: { external: true },
		} );

		if ( shouldAdjustColumns ) {
			this.adjustColumns();
		}
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

	resetLayout: function( shouldAdjustColumns = true ) {
		this.setStructure( this.getDefaultStructure(), shouldAdjustColumns );
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
				},
			} );
		} );
	},

	isCollectionFilled: function() {
		return ( DEFAULT_MAX_COLUMNS <= this.collection.length );
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

	destroyAddSectionView: function() {
		if ( this.addSectionView && ! this.addSectionView.isDestroyed ) {
			this.addSectionView.destroy();
		}
	},

	onRender: function() {
		BaseElementView.prototype.onRender.apply( this, arguments );

		this.toggleSectionIsFull();
	},

	onAddButtonClick: function() {
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
		} );
	},

	onDestroy: function() {
		BaseElementView.prototype.onDestroy.apply( this, arguments );

		this.destroyAddSectionView();
	},
} );

module.exports = SectionView;

module.exports.DEFAULT_INNER_SECTION_COLUMNS = DEFAULT_INNER_SECTION_COLUMNS;
module.exports.DEFAULT_MIN_COLUMN_SIZE = DEFAULT_MIN_COLUMN_SIZE;
module.exports.DEFAULT_MAX_COLUMNS = DEFAULT_MAX_COLUMNS;
