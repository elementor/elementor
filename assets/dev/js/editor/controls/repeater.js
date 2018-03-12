var ControlBaseDataView = require( 'elementor-controls/base-data' ),
	RepeaterRowView = require( 'elementor-controls/repeater-row' ),
	BaseSettingsModel = require( 'elementor-elements/models/base-settings' ),
	ControlRepeaterItemView;

ControlRepeaterItemView = ControlBaseDataView.extend( {
	ui: {
		btnAddRow: '.elementor-repeater-add',
		fieldContainer: '.elementor-repeater-fields-wrapper'
	},

	events: function() {
		return {
			'click @ui.btnAddRow': 'onButtonAddRowClick',
			'sortstart @ui.fieldContainer': 'onSortStart',
			'sortupdate @ui.fieldContainer': 'onSortUpdate',
			'sortstop @ui.fieldContainer': 'onSortStop'
		};
	},

	childView: RepeaterRowView,

	childViewContainer: '.elementor-repeater-fields-wrapper',

	templateHelpers: function() {
		return {
			data: _.extend( {}, this.model.toJSON(), { controlValue: [] } )
		};
	},

	childViewOptions: function() {
		return {
			controlFields: this.model.get( 'fields' ),
			titleField: this.model.get( 'title_field' ),
			parentModel: this.elementSettingsModel // For parentConditions in repeaterRow
		};
	},

	createItemModel: function( attrs, options, controlView ) {
		options = options || {};

		options.controls = controlView.model.get( 'fields' );

		if ( ! attrs._id ) {
			attrs._id = elementor.helpers.getUniqueID();
		}

		return new BaseSettingsModel( attrs, options );
	},

	fillCollection: function() {
		var controlName = this.model.get( 'name' );
		this.collection = this.elementSettingsModel.get( controlName );

		if ( ! ( this.collection instanceof Backbone.Collection ) ) {
			this.collection = new Backbone.Collection( this.collection, {
				// Use `partial` to supply the `this` as an argument, but not as context
				// the `_` is a place holder for original arguments: `attrs` & `options`
				model: _.partial( this.createItemModel, _, _, this )
			} );

			// Set the value silent
			this.elementSettingsModel.set( controlName, this.collection, { silent: true } );
			this.listenTo( this.collection, 'change', this.onRowControlChange );
			this.listenTo( this.collection, 'update', this.onRowUpdate, this );
		}
	},

	initialize: function( options ) {
		ControlBaseDataView.prototype.initialize.apply( this, arguments );

		this.fillCollection();

		this.listenTo( this.collection, 'change', this.onRowControlChange );
		this.listenTo( this.collection, 'update', this.onRowUpdate, this );
	},

	addRow: function( data, options ) {
		var id = elementor.helpers.getUniqueID();

		if ( data instanceof Backbone.Model ) {
			data.set( '_id', id );
		} else {
			data._id = id;
		}

		return this.collection.add( data, options );
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
		var activeItemIndex = 0;

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

		this.ui.fieldContainer.sortable( { axis: 'y', handle: '.elementor-repeater-row-tools' } );

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
		var oldIndex = ui.item.data( 'oldIndex' ),
			model = this.collection.at( oldIndex ),
			newIndex = ui.item.index();

		this.collection.remove( model );

		this.addRow( model, { at: newIndex } );
	},

	onAddChild: function() {
		this.updateChildIndexes();
		this.updateActiveRow();
	},

	onRemoveChild: function( childView ) {
		if ( childView === this.currentEditableChild ) {
			delete this.currentEditableChild;
		}

		this.updateChildIndexes();
		this.updateActiveRow();
	},

	onRowUpdate: function( collection, event ) {
		// Simulate `changed` and `_previousAttributes` values
		var settings = this.elementSettingsModel,
			collectionCloned = collection.clone(),
			controlName = this.model.get( 'name' );

		if ( event.add ) {
			collectionCloned.remove( event.changes.added[0] );
		} else {
			collectionCloned.add( event.changes.removed[0], { at: event.index } );
		}

		settings.changed = {};
		settings.changed[ controlName ] = collection;

		settings._previousAttributes = {};
		settings._previousAttributes[ controlName ] = collectionCloned.toJSON();

		settings.trigger( 'change', settings,  settings._pending );

		delete settings.changed;
		delete settings._previousAttributes;

		this.toggleMinRowsClass();
	},

	onRowControlChange: function( model ) {
		// Simulate `changed` and `_previousAttributes` values
		var changed = Object.keys( model.changed );

		if ( ! changed.length ) {
			return;
		}

		var collectionCloned = model.collection.toJSON(),
			modelIndex = model.collection.findIndex( model ),
			element = this._parent.model,
			settings = element.get( 'settings' ),
			controlName = this.model.get( 'name' );

		// Save it with old values
		collectionCloned[ modelIndex ] = model._previousAttributes;

		settings.changed = {};
		settings.changed[ controlName ] =  model.collection;

		settings._previousAttributes = {};
		settings._previousAttributes[ controlName ] = collectionCloned;

		settings.trigger( 'change', settings );

		delete settings.changed;
		delete settings._previousAttributes;
	},

	onButtonAddRowClick: function() {
		var defaults = {};
		_.each( this.model.get( 'fields' ), function( field ) {
			defaults[ field.name ] = field['default'];
		} );

		var newModel = this.addRow( defaults ),
			newChildView = this.children.findByModel( newModel );

		this.editRow( newChildView );
		this.render();
	},

	onChildviewClickRemove: function( childView ) {
		childView.model.destroy();
		this.render();
	},

	onChildviewClickDuplicate: function( childView ) {
		var newModel = this.createItemModel( childView.model.toJSON(), {}, this );
		this.addRow( newModel, { at: childView.itemIndex } );
		this.render();
	},

	onChildviewClickEdit: function( childView ) {
		this.editRow( childView );
	},

	onAfterExternalChange: function() {
		// Update the collection with current value
		this.fillCollection();

		ControlBaseDataView.prototype.onAfterExternalChange.apply( this, arguments );
	}
} );

module.exports = ControlRepeaterItemView;
