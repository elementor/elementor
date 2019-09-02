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

	childViewOptions: function() {
		return {
			element: this.getOption( 'element' ),
			controlFields: this.model.get( 'fields' ),
			titleField: this.model.get( 'title_field' ),
			itemActions: this.model.get( 'item_actions' ),
		};
	},

	createItemModel: function( attrs, options, controlView ) {
		options = options || {};

		options.controls = controlView.model.get( 'fields' );

		if ( ! attrs._id ) {
			attrs._id = elementor.helpers.getUniqueID();
		}

		return new elementorModules.editor.elements.models.BaseSettings( attrs, options );
	},

	fillCollection: function() {
		var controlName = this.model.get( 'name' );
		this.collection = this.elementSettingsModel.get( controlName );

		// Hack for history redo/undo
		if ( ! ( this.collection instanceof Backbone.Collection ) ) {
			this.collection = new Backbone.Collection( this.collection, {
				// Use `partial` to supply the `this` as an argument, but not as context
				// the `_` is a place holder for original arguments: `attrs` & `options`
				model: _.partial( this.createItemModel, _, _, this ),
			} );

			// Set the value silent
			this.elementSettingsModel.set( controlName, this.collection, { silent: true } );
		}
	},

	initialize: function() {
		ControlBaseDataView.prototype.initialize.apply( this, arguments );

		this.fillCollection();
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

		$e.run( 'document/elements/repeater/active', {
			element: this.options.element,
			index: rowView._index + 1,
		} );
	},

	toggleMinRowsClass: function() {
		if ( ! this.model.get( 'prevent_empty' ) ) {
			return;
		}

		this.$el.toggleClass( 'elementor-repeater-has-minimum-rows', 1 >= this.collection.length );
	},

	onRender: function() {
		ControlBaseDataView.prototype.onRender.apply( this, arguments );

		if ( this.model.get( 'item_actions' ).sort ) {
			this.ui.fieldContainer.sortable( { axis: 'y', handle: '.elementor-repeater-row-tools' } );
		}
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

		$e.run( 'document/elements/repeater/move', {
			element: this.options.element,
			name: this.model.get( 'name' ),
			sourceIndex: oldIndex,
			targetIndex: newIndex,
		} );
	},

	onButtonAddRowClick: function() {
		const defaults = {};

		// Get default fields.
		Object.entries( this.model.get( 'fields' ) ).forEach( ( [ key, field ] ) => {
			defaults[ key ] = field.default;
		} );

		// TODO: Ask Mati.
		if ( defaults[ 'tab_title' ] ) {
			defaults[ 'tab_title' ] += ' #' + ( this.collection.length + 1 );
		}

		const newModel = $e.run( 'document/elements/repeater/insert', {
			element: this.options.element,
			name: this.model.get( 'name' ),
			model: defaults,
			returnValue: true,
		} );

		this.editRow( this.children.findByModel( newModel ) );

		this.toggleMinRowsClass();
	},

	onChildviewClickRemove: function( childView ) {
		$e.run( 'document/elements/repeater/remove', {
			element: this.options.element,
			name: this.model.get( 'name' ),
			index: childView._index,
		} );

		this.toggleMinRowsClass();
	},

	onChildviewClickDuplicate: function( childView ) {
		$e.run( 'document/elements/repeater/duplicate', {
			element: this.options.element,
			name: this.model.get( 'name' ),
			index: childView._index,
		} );

		this.toggleMinRowsClass();
	},

	onChildviewClickEdit: function( childView ) {
		this.editRow( childView );

		$e.run( 'document/elements/repeater/active', {
			element: this.options.element,
			index: childView._index + 1,
		} );
	},
} );

module.exports = ControlRepeaterItemView;
