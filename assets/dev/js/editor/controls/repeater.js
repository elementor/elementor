var ControlBaseDataView = require( 'elementor-controls/base-data' ),
	RepeaterRowView = require( 'elementor-controls/repeater-row' ),
	ControlRepeaterItemView;

ControlRepeaterItemView = ControlBaseDataView.extend( {
	ui: {
		btnAddRow: '.elementor-repeater-add',
		fieldContainer: '.elementor-repeater-fields-wrapper',
	},

	events() {
		return {
			'click @ui.btnAddRow': 'onButtonAddRowClick',
			'sortstart @ui.fieldContainer': 'onSortStart',
			'sortupdate @ui.fieldContainer': 'onSortUpdate',
			'sortstop @ui.fieldContainer': 'onSortStop',
		};
	},

	childView: RepeaterRowView,

	childViewContainer: '.elementor-repeater-fields-wrapper',

	templateHelpers() {
		return {
			itemActions: this.model.get( 'item_actions' ),
			data: _.extend( {}, this.model.toJSON(), { controlValue: [] } ),
		};
	},

	childViewOptions( rowModel, index ) {
		const elementContainer = this.getOption( 'container' );

		return {
			container: elementContainer.repeaters[ this.model.get( 'name' ) ].children[ index ],
			controlFields: this.model.get( 'fields' ),
			titleField: this.model.get( 'title_field' ),
			itemActions: this.model.get( 'item_actions' ),
		};
	},

	createItemModel( attrs, options, controlView ) {
		options.controls = controlView.model.get( 'fields' );

		return new elementorModules.editor.elements.models.BaseSettings( attrs, options );
	},

	fillCollection() {
		// TODO: elementSettingsModel is deprecated since 2.8.0.
		const settings = this.container ? this.container.settings : this.elementSettingsModel;

		var controlName = this.model.get( 'name' );
		this.collection = settings.get( controlName );

		// Hack for history redo/undo
		if ( ! ( this.collection instanceof Backbone.Collection ) ) {
			this.collection = new Backbone.Collection( this.collection, {
				// Use `partial` to supply the `this` as an argument, but not as context
				// the `_` is a place holder for original arguments: `attrs` & `options`
				model: _.partial( this.createItemModel, _, _, this ),
			} );

			// Set the value silent
			settings.set( controlName, this.collection, { silent: true } );
		}
	},

	initialize() {
		ControlBaseDataView.prototype.initialize.apply( this, arguments );

		this.fillCollection();

		this.listenTo( this.collection, 'reset', this.resetContainer.bind( this ) );

		this.listenTo( this.collection, 'add', this.updateContainer.bind( this ) );
	},

	editRow( rowView ) {
		if ( this.currentEditableChild ) {
			var currentEditable = this.currentEditableChild.getChildViewContainer( this.currentEditableChild );
			currentEditable.removeClass( 'editable' );

			// If the repeater contains TinyMCE editors, fire the `hide` trigger to hide floated toolbars
			currentEditable.find( '.elementor-wp-editor' ).each( function() {
				tinymce.get( this.id ).fire( 'hide' );
			} );
		}

		if ( this.currentEditableChild === rowView ) {
			delete this.currentEditableChild;
			return;
		}

		rowView.getChildViewContainer( rowView ).addClass( 'editable' );

		this.currentEditableChild = rowView;

		this.updateActiveRow();
	},

	toggleClasses() {
		this.toggleMinRowsClass();
		this.toggleMaxRowsClass();
	},

	toggleMaxRowsClass() {
		const maxItems = this.model.get( 'max_items' );
		if ( ! maxItems || ! Number.isInteger( maxItems ) ) {
			return;
		}

		this.$el.toggleClass( 'elementor-repeater-has-maximum-rows', maxItems <= this.collection.length );
	},

	getMinItems() {
		let minItems = 0;

		if ( this.model.get( 'min_items' ) && Number.isInteger( this.model.get( 'min_items' ) ) ) {
			minItems = this.model.get( 'min_items' );
		} else if ( this.model.get( 'prevent_empty' ) ) {
			minItems = 1;
		}

		return minItems;
	},

	toggleMinRowsClass() {
		const minItems = this.getMinItems();

		if ( ! minItems ) {
			return;
		}

		this.$el.toggleClass( 'elementor-repeater-has-minimum-rows', minItems >= this.collection.length );
	},

	updateActiveRow() {
		var activeItemIndex = 1;

		if ( this.currentEditableChild ) {
			activeItemIndex = this.currentEditableChild.itemIndex;
		}

		this.setEditSetting( 'activeItemIndex', activeItemIndex );
	},

	updateChildIndexes() {
		var collection = this.collection;

		this.children.each( function( view ) {
			view.updateIndex( collection.indexOf( view.model ) + 1 );

			view.setTitle();
		} );
	},

	getSortableParams: () => {
		return {
			axis: 'y',
			handle: '.elementor-repeater-row-tools',
			items: ' > :not(.elementor-repeater-row--disable-sort)',
			cancel: '', // Elements that do not allow sorting (by default it includs buttons).
		};
	},

	onRender() {
		ControlBaseDataView.prototype.onRender.apply( this, arguments );

		if ( this.model.get( 'item_actions' ).sort ) {
			this.ui.fieldContainer.sortable( this.getSortableParams() );
		}

		this.toggleClasses();
	},

	onSortStart( event, ui ) {
		ui.item.data( 'oldIndex', ui.item.index() );
	},

	onSortStop( event, ui ) {
		// Reload TinyMCE editors (if exist), it's a bug that TinyMCE content is missing after stop dragging
		var self = this,
			sortedIndex = ui.item.index();

		if ( -1 === sortedIndex ) {
			return;
		}

		var sortedRowView = self.children.findByIndex( ui.item.index() ),
			rowControls = sortedRowView.children._views;

		jQuery.each( rowControls, function() {
			if ( 'wysiwyg' === this.model.get( 'type' ) ) {
				sortedRowView.render();

				delete self.currentEditableChild;

				return false;
			}
		} );
	},

	onSortUpdate( event, ui ) {
		const oldIndex = ui.item.data( 'oldIndex' ),
			newIndex = ui.item.index();

		$e.run( 'document/repeater/move', {
			container: this.options.container,
			name: this.model.get( 'name' ),
			sourceIndex: oldIndex,
			targetIndex: newIndex,
		} );
	},

	onAddChild() {
		this.updateChildIndexes();
		this.updateActiveRow();
		this.toggleClasses();
	},

	/**
	 * Update container to ensure that new child elements appear in container children.
	 *
	 * @param {*} model - Container model.
	 */
	updateContainer( model ) {
		const container = this.options.container.repeaters[ this.model.get( 'name' ) ],
			isInChildren = container.children.filter( ( child ) => {
				return child.id === model.get( '_id' );
			} );

		if ( ! isInChildren.length ) {
			elementorDevTools.deprecation.deprecated( 'Don\'t add models directly to the repeater.', '3.0.0', '$e.run( \'document/repeater/insert\' )' );
			this.options.container.addRepeaterItem( this.model.get( 'name' ), model, model.collection.indexOf( model ) );
		}
	},

	/**
	 * Reset container to ensure that container children are reset on collection reset.
	 *
	 * @deprecated since 3.0.0, use `$e.run( 'document/repeater/remove' )` instead.
	 */
	resetContainer() {
		elementorDevTools.deprecation.deprecated( 'Don\'t reset repeater collection directly.', '3.0.0', '$e.run( \'document/repeater/remove\' )' );
		this.options.container.repeaters[ this.model.get( 'name' ) ].children = [];
	},

	getDefaults() {
		const defaults = {};

		// Get default fields.
		_.each( this.model.get( 'fields' ), ( field ) => {
			defaults[ field.name ] = field.default;
		} );

		return defaults;
	},

	getChildControlView( id ) {
		return this.getControlViewByModel( this.getControlModel( id ) );
	},

	getControlViewByModel( model ) {
		return this.children.findByModelCid( model.cid );
	},

	getControlModel( _id ) {
		return this.collection.findWhere( { _id } );
	},

	onButtonAddRowClick() {
		const newModel = $e.run( 'document/repeater/insert', {
			container: this.options.container,
			name: this.model.get( 'name' ),
			model: this.getDefaults(),
		} );

		const newChild = this.children.findByModel( newModel );

		this.editRow( newChild );

		this.toggleClasses();
	},

	onChildviewClickRemove( childView ) {
		if ( childView === this.currentEditableChild ) {
			delete this.currentEditableChild;
		}

		$e.run( 'document/repeater/remove', {
			container: this.options.container,
			name: this.model.get( 'name' ),
			index: childView._index,
		} );

		this.updateActiveRow();
		this.updateChildIndexes();

		this.toggleClasses();
	},

	onChildviewClickDuplicate( childView ) {
		$e.run( 'document/repeater/duplicate', {
			container: this.options.container,
			name: this.model.get( 'name' ),
			index: childView._index,
		} );

		this.toggleClasses();
	},

	onChildviewClickEdit( childView ) {
		this.editRow( childView );
	},

	onAfterExternalChange() {
		// Update the collection with current value
		this.fillCollection();

		ControlBaseDataView.prototype.onAfterExternalChange.apply( this, arguments );
	},
} );

module.exports = ControlRepeaterItemView;
