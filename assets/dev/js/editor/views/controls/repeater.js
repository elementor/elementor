var ControlBaseItemView = require( 'elementor-views/controls/base' ),
	RepeaterRowView = require( 'elementor-views/controls/repeater-row' ),
	ControlRepeaterItemView;

ControlRepeaterItemView = ControlBaseItemView.extend( {
	ui: {
		btnAddRow: '.elementor-repeater-add',
		fieldContainer: '.elementor-repeater-fields'
	},

	events: {
		'click @ui.btnAddRow': 'onButtonAddRowClick',
		'sortstart @ui.fieldContainer': 'onSortStart',
		'sortupdate @ui.fieldContainer': 'onSortUpdate'
	},

	childView: RepeaterRowView,

	childViewContainer: '.elementor-repeater-fields',

	templateHelpers: function() {
		return {
			data: _.extend( {}, this.model.toJSON(), { controlValue: [] } )
		};
	},

	childViewOptions: function() {
		return {
			controlFields: this.model.get( 'fields' ),
			titleField: this.model.get( 'title_field' )
		};
	},

	initialize: function( options ) {
		ControlBaseItemView.prototype.initialize.apply( this, arguments );

		this.collection = this.elementSettingsModel.get( this.model.get( 'name' ) );

		this.listenTo( this.collection, 'change add remove reset', this.onCollectionChanged, this );
	},

	editRow: function( rowView ) {
		if ( this.currentEditableChild ) {
			this.currentEditableChild.getChildViewContainer( this.currentEditableChild ).removeClass( 'editable' );
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
		this.children.each( _.bind( function( view ) {
			view.updateIndex( this.collection.indexOf( view.model ) + 1 );
		}, this ) );
	},

	onRender: function() {
		this.ui.fieldContainer.sortable( { axis: 'y' } );

		this.toggleMinRowsClass();
	},

	onSortStart: function( event, ui ) {
		ui.item.data( 'oldIndex', ui.item.index() );
	},

	onSortUpdate: function( event, ui ) {
		var oldIndex = ui.item.data( 'oldIndex' ),
			model = this.collection.at( oldIndex ),
			newIndex = ui.item.index();

		this.collection.remove( model );
		this.collection.add( model, { at: newIndex } );
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

	onCollectionChanged: function() {
		this.elementSettingsModel.trigger( 'change' );

		this.toggleMinRowsClass();
	},

	onButtonAddRowClick: function() {
		var defaults = {};
		_.each( this.model.get( 'fields' ), function( field ) {
			defaults[ field.name ] = field['default'];
		} );

		var newModel = this.collection.add( defaults ),
			newChildView = this.children.findByModel( newModel );

		this.editRow( newChildView );
	},

	onChildviewClickRemove: function( childView ) {
		childView.model.destroy();
	},

	onChildviewClickDuplicate: function( childView ) {
		this.collection.add( childView.model.clone(), { at: childView.itemIndex } );
	},

	onChildviewClickEdit: function( childView ) {
		this.editRow( childView );
	}
} );

module.exports = ControlRepeaterItemView;
