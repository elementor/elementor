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

	updateIndex: function( newIndex ) {
		this.itemIndex = newIndex;
		this.render();
	},

	setDynamicTitle: function() {
		var dynamicTitle = this.model.get( this.getOption( 'titleField' ) );

		if ( ! dynamicTitle ) {
			dynamicTitle = elementor.translate( 'Item #{0}', [ this.getOption( 'itemIndex' ) ] );
		}

		this.ui.itemTitle.text( dynamicTitle );
	},

	initialize: function( options ) {
		this.elementSettingsModel = options.elementSettingsModel;

		this.itemIndex = 0;

		// Collection for Controls list
		this.collection = new Backbone.Collection( options.controlFields );

		if ( options.titleField ) {
			this.listenTo( this.model, 'change:' + options.titleField, this.setDynamicTitle );
		}
	},

	onRender: function() {
		this.setDynamicTitle();
	}
} );

module.exports = RepeaterRowView;
