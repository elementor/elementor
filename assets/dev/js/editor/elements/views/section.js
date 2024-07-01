import AddSectionView from '../../views/add-section/inline';

const BaseElementView = require( 'elementor-elements/views/base' );

const DEFAULT_INNER_SECTION_COLUMNS = 2,
	DEFAULT_MIN_COLUMN_SIZE = 2,
	DEFAULT_MAX_COLUMNS = 10;

const SectionView = BaseElementView.extend( {
	childViewContainer() {
		return '> .elementor-container';
	},

	template: Marionette.TemplateCache.get( '#tmpl-elementor-section-content' ),

	addSectionView: null,

	/**
	 * @deprecated since 2.9.0, use `toggleSectionIsFull()` instead.
	 */
	_checkIsFull() {
		this.toggleSectionIsFull();

		elementorDevTools.deprecation.deprecated( '_checkIsFull()', '2.9.0', 'toggleSectionIsFull()' );
	},

	toggleSectionIsFull() {
		this.$el.toggleClass( 'elementor-section-filled', this.isCollectionFilled() );
	},

	addChildModel( model ) {
		// TODO: maybe should be part of $e.hooks.
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

	className() {
		var classes = BaseElementView.prototype.className.apply( this, arguments ),
			type = this.isInner() ? 'inner' : 'top';

		return classes + ' elementor-section elementor-' + type + '-section';
	},

	tagName() {
		return this.model.getSetting( 'html_tag' ) || 'section';
	},

	behaviors() {
		var behaviors = BaseElementView.prototype.behaviors.apply( this, arguments );

		_.extend( behaviors, {
			Sortable: {
				behaviorClass: require( 'elementor-behaviors/sortable' ),
				elChildType: 'column',
			},
		} );

		return elementor.hooks.applyFilters( 'elements/section/behaviors', behaviors, this );
	},

	initialize() {
		BaseElementView.prototype.initialize.apply( this, arguments );

		this.model.get( 'editSettings' ).set( 'defaultEditRoute', 'layout' );
	},

	getEditButtons() {
		if ( ! $e.components.get( 'document/elements' ).utils.allowAddingWidgets() ) {
			return {};
		}

		const elementData = elementor.getElementData( this.model ),
			editTools = {};

		if ( ! this.isInner() ) {
			editTools.add = {
				/* Translators: %s: Element name. */
				title: sprintf( __( 'Add %s', 'elementor' ), elementData.title ),
				icon: 'plus',
			};
		}

		editTools.edit = {
			/* Translators: %s: Element name. */
			title: sprintf( __( 'Edit %s', 'elementor' ), elementData.title ),
			icon: 'handle',
		};

		if ( elementor.getPreferences( 'edit_buttons' ) ) {
			editTools.duplicate = {
				/* Translators: %s: Element name. */
				title: sprintf( __( 'Duplicate %s', 'elementor' ), elementData.title ),
				icon: 'clone',
			};
		}
		return editTools;
	},

	getContextMenuGroups() {
		var groups = BaseElementView.prototype.getContextMenuGroups.apply( this, arguments ),
			transferGroupIndex = groups.indexOf( _.findWhere( groups, { name: 'clipboard' } ) );

		groups.splice( transferGroupIndex + 1, 0, {
			name: 'save',
			actions: [
				{
					name: 'save',
					title: __( 'Save as Template', 'elementor' ),
					isEnabled: () => ! elementor.selection.isMultiple(),
					callback: this.save.bind( this ),
				},
			],
		} );

		return groups;
	},

	getSortableOptions() {
		var sectionConnectClass = this.isInner() ? '.elementor-inner-section' : '.elementor-top-section';

		return {
			connectWith: sectionConnectClass + this.childViewContainer(),
			handle: '> .elementor-element-overlay .elementor-editor-element-edit',
			items: '> .elementor-column',
			forcePlaceholderSize: true,
			tolerance: 'pointer',
		};
	},

	getColumnPercentSize( element, size ) {
		return +( size / element.parent().width() * 100 ).toFixed( 3 );
	},

	getDefaultStructure() {
		return this.collection.length + '0';
	},

	getStructure() {
		return this.model.getSetting( 'structure' );
	},

	getColumnAt( index ) {
		var model = this.collection.at( index );

		return model ? this.children.findByModelCid( model.cid ) : null;
	},

	getNextColumn( columnView ) {
		return this.getColumnAt( this.collection.indexOf( columnView.model ) + 1 );
	},

	getPreviousColumn( columnView ) {
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

	setStructure( structure, shouldAdjustColumns = true ) {
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

	adjustColumns() {
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

	resetLayout( shouldAdjustColumns = true ) {
		this.setStructure( this.getDefaultStructure(), shouldAdjustColumns );
	},

	resetColumnsCustomSize() {
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

	isCollectionFilled() {
		return ( DEFAULT_MAX_COLUMNS <= this.collection.length );
	},

	showChildrenPercentsTooltip( columnView, nextColumnView ) {
		columnView.ui.percentsTooltip.show();

		columnView.ui.percentsTooltip.attr( 'data-side', elementorCommon.config.isRTL ? 'right' : 'left' );

		nextColumnView.ui.percentsTooltip.show();

		nextColumnView.ui.percentsTooltip.attr( 'data-side', elementorCommon.config.isRTL ? 'left' : 'right' );
	},

	hideChildrenPercentsTooltip( columnView, nextColumnView ) {
		columnView.ui.percentsTooltip.hide();

		nextColumnView.ui.percentsTooltip.hide();
	},

	destroyAddSectionView() {
		if ( this.addSectionView && ! this.addSectionView.isDestroyed ) {
			this.addSectionView.destroy();
		}
	},

	onRender() {
		BaseElementView.prototype.onRender.apply( this, arguments );

		this.toggleSectionIsFull();
	},

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

	onChildviewRequestResizeStart( columnView ) {
		var nextColumnView = this.getNextColumn( columnView );

		if ( ! nextColumnView ) {
			return;
		}

		this.showChildrenPercentsTooltip( columnView, nextColumnView );

		var $iframes = columnView.$el.find( 'iframe' ).add( nextColumnView.$el.find( 'iframe' ) );

		elementor.helpers.disableElementEvents( $iframes );
	},

	onChildviewRequestResizeStop( columnView ) {
		var nextColumnView = this.getNextColumn( columnView );

		if ( ! nextColumnView ) {
			return;
		}

		this.hideChildrenPercentsTooltip( columnView, nextColumnView );

		var $iframes = columnView.$el.find( 'iframe' ).add( nextColumnView.$el.find( 'iframe' ) );

		elementor.helpers.enableElementEvents( $iframes );
	},

	onChildviewRequestResize( columnView, ui ) {
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

	onDestroy() {
		BaseElementView.prototype.onDestroy.apply( this, arguments );

		this.destroyAddSectionView();
	},
} );

module.exports = SectionView;

module.exports.DEFAULT_INNER_SECTION_COLUMNS = DEFAULT_INNER_SECTION_COLUMNS;
module.exports.DEFAULT_MIN_COLUMN_SIZE = DEFAULT_MIN_COLUMN_SIZE;
module.exports.DEFAULT_MAX_COLUMNS = DEFAULT_MAX_COLUMNS;
