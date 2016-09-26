var RepeaterRowView;

RepeaterRowView = Marionette.CompositeView.extend( {
	template: Marionette.TemplateCache.get( '#tmpl-elementor-repeater-row' ),

	className: 'repeater-fields',

	ui: {
		duplicateButton: '.elementor-repeater-tool-duplicate',
		editButton: '.elementor-repeater-tool-edit',
		removeButton: '.elementor-repeater-tool-remove',
		itemTitle: '.elementor-repeater-row-item-title'
	},

	triggers: {
		'click @ui.removeButton': 'click:remove',
		'click @ui.duplicateButton': 'click:duplicate',
		'click @ui.itemTitle': 'click:edit'
	},

	templateHelpers: function() {
		return {
			itemIndex: this.getOption( 'itemIndex' )
		};
	},

	childViewContainer: '.elementor-repeater-row-controls',

	getChildView: function( item ) {
		var controlType = item.get( 'type' );
		return elementor.getControlItemView( controlType );
	},

	childViewOptions: function() {
		return {
			elementSettingsModel: this.model
		};
	},

	checkConditions: function() {
		var self = this;

		self.collection.each( function( model ) {
			var conditions = model.get( 'conditions' ),
				isVisible = true;

			if ( conditions ) {
				isVisible = elementor.conditions.check( conditions, self.model.attributes );
			}

			var child = self.children.findByModelCid( model.cid );

			child.$el.toggle( isVisible );
		} );
	},

	updateIndex: function( newIndex ) {
		this.itemIndex = newIndex;
		this.setTitle();
	},

	setTitle: function() {
		var self = this,
			titleField = self.getOption( 'titleField' ),
			title = '';

		if ( titleField ) {
			title = titleField.replace( /\{([a-z_0-9]+)}/g, function() {
				var changerControlModel = self.collection.find( { name: arguments[1] } ),
					changerControlView = self.children.findByModelCid( changerControlModel.cid );

				return changerControlView.getFieldTitleValue();
			} );
		}

		if ( ! title ) {
			title = elementor.translate( 'Item #{0}', [ self.getOption( 'itemIndex' ) ] );
		}

		self.ui.itemTitle.text( title );
	},

	initialize: function( options ) {
		var self = this;

		self.elementSettingsModel = options.elementSettingsModel;

		self.itemIndex = 0;

		// Collection for Controls list
		self.collection = new Backbone.Collection( options.controlFields );

		self.listenTo( self.model, 'change', self.checkConditions );

		if ( options.titleField ) {
			var fields = options.titleField.match( /\{[a-z_0-9]+}/g );

			_.each( fields, function( field ) {
				field = field.replace( /\{|}/g, '' );

				self.listenTo( self.model, 'change:' + field, self.setTitle );
			} );
		}
	},

	onRender: function() {
		this.setTitle();
		this.checkConditions();
	}
} );

module.exports = RepeaterRowView;
