var ControlBaseDataView = require( 'elementor-controls/base-data' ),
	RepeaterRowView = require( 'elementor-controls/repeater-row' ),
	ControlRepeaterItemView;

ControlRepeaterItemView = ControlBaseDataView.extend( {
	ui: {
		btnAddRow: '.elementor-repeater-add',
		fieldContainer: '.elementor-repeater-fields-wrapper',
	},

	events: function() {
		return {
			'click @ui.btnAddRow': 'onButtonAddRowClick',
			'sortstart @ui.fieldContainer': 'onSortStart',
			'sortupdate @ui.fieldContainer': 'onSortUpdate',
			'sortstop @ui.fieldContainer': 'onSortStop',
		};
	},

	childView: RepeaterRowView,

	childViewContainer: '.elementor-repeater-fields-wrapper',

	templateHelpers: function() {
		return {
			itemActions: this.model.get( 'item_actions' ),
			data: _.extend( {}, this.model.toJSON(), { controlValue: [] } ),
		};
	},

	childViewOptions: function( rowModel, index ) {
		const elementContainer = this.getOption( 'container' );

		return {
			container: elementContainer.repeaters[ this.model.get( 'name' ) ].children[ index ],
			controlFields: this.model.get( 'fields' ),
			titleField: this.model.get( 'title_field' ),
			itemActions: this.model.get( 'item_actions' ),
		};
	},

	createItemModel: function( attrs, options, controlView ) {
		options.controls = controlView.model.get( 'fields' );

		return new elementorModules.editor.elements.models.BaseSettings( attrs, options );
	},

	fillCollection: function() {
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

	initialize: function() {
		ControlBaseDataView.prototype.initialize.apply( this, arguments );

		this.fillCollection();

		this.listenTo( this.collection, 'reset', this.resetContainer.bind( this ) );

		this.listenTo( this.collection, 'add', this.updateContainer.bind( this ) );
	},

	editRow: function( rowView ) {
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

	toggleMinRowsClass: function() {
		if ( ! this.model.get( 'prevent_empty' ) ) {
			return;
		}

		this.$el.toggleClass( 'elementor-repeater-has-minimum-rows', 1 >= this.collection.length );
	},

	updateActiveRow: function() {
		var activeItemIndex = 1;

		if ( this.currentEditableChild ) {
			activeItemIndex = this.currentEditableChild.itemIndex;
		}

		this.setEditSetting( 'activeItemIndex', activeItemIndex );
	},

	updateChildIndexes: function() {
		var collection = this.collection;

		this.children.each( function( view ) {
			view.updateIndex( collection.indexOf( view.model ) + 1 );

			view.setTitle();
		} );
	},

	onRender: function() {
		ControlBaseDataView.prototype.onRender.apply( this, arguments );

		if ( this.model.get( 'item_actions' ).sort ) {
			this.ui.fieldContainer.sortable( {
				axis: 'y',
				handle: '.elementor-repeater-row-tools',
				items: ' > :not(.elementor-repeater-row--disable-sort)',
			} );
		}

		this.toggleMinRowsClass();
	},

	onSortStart: function( event, ui ) {
		ui.item.data( 'oldIndex', ui.item.index() );
	},

	onSortStop: function( event, ui ) {
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

	onSortUpdate: function( event, ui ) {
		const oldIndex = ui.item.data( 'oldIndex' ),
			newIndex = ui.item.index();

		$e.run( 'document/repeater/move', {
			container: this.options.container,
			name: this.model.get( 'name' ),
			sourceIndex: oldIndex,
			targetIndex: newIndex,
		} );
	},

	onAddChild: function() {
		this.updateChildIndexes();
		this.updateActiveRow();
	},

	// BC since 3.0.0, ensure a new child is appear in container children.
	updateContainer( model ) {
		const container = this.options.container.repeaters[ this.model.get( 'name' ) ],
			isInChildren = container.children.filter( ( child ) => {
				return child.id === model.get( '_id' );
			} );

		if ( ! isInChildren.length ) {
			elementorCommon.helpers.softDeprecated( 'Don\'t add models directly to the repeater.', '3.0.0', '$e.run( \'document/repeater/insert\' )' );
			this.options.container.addRepeaterItem( this.model.get( 'name' ), model, model.collection.indexOf( model ) );
		}
	},

	// BC since 3.0.0, ensure a container children are reset on collection reset.
	resetContainer: function() {
		elementorCommon.helpers.softDeprecated( 'Don\'t reset repeater collection directly.', '3.0.0', '$e.run( \'document/repeater/remove\' )' );
		this.options.container.repeaters[ this.model.get( 'name' ) ].children = [];
	},

	getDefaults: function() {
		const defaults = {};

		// Get default fields.
		_.each( this.model.get( 'fields' ), ( field ) => {
			defaults[ field.name ] = field.default;
		} );

		return defaults;
	},

	onButtonAddRowClick: function() {
		const newModel = $e.run( 'document/repeater/insert', {
			container: this.options.container,
			name: this.model.get( 'name' ),
			model: this.getDefaults(),
		} );

		const newChild = this.children.findByModel( newModel );

		this.editRow( newChild );

		this.toggleMinRowsClass();
	},

	onChildviewClickRemove: function( childView ) {
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

		this.toggleMinRowsClass();
	},

	onChildviewClickDuplicate: function( childView ) {
		$e.run( 'document/repeater/duplicate', {
			container: this.options.container,
			name: this.model.get( 'name' ),
			index: childView._index,
		} );

		this.toggleMinRowsClass();
	},

	onChildviewClickEdit: function( childView ) {
		this.editRow( childView );
	},

	onAfterExternalChange: function() {
		// Update the collection with current value
		this.fillCollection();

		ControlBaseDataView.prototype.onAfterExternalChange.apply( this, arguments );
	},
} );

module.exports = ControlRepeaterItemView;
