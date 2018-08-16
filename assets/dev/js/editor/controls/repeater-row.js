var ControlBaseDataView = require( 'elementor-controls/base-data' ),
	RepeaterRowView;

RepeaterRowView = Marionette.CompositeView.extend( {
	template: Marionette.TemplateCache.get( '#tmpl-elementor-repeater-row' ),

	className: 'elementor-repeater-fields',

	ui: {
		duplicateButton: '.elementor-repeater-tool-duplicate',
		editButton: '.elementor-repeater-tool-edit',
		removeButton: '.elementor-repeater-tool-remove',
		itemTitle: '.elementor-repeater-row-item-title'
	},

	behaviors: {
		HandleInnerTabs: {
			behaviorClass: require( 'elementor-behaviors/inner-tabs' )
		}
	},

	triggers: {
		'click @ui.removeButton': 'click:remove',
		'click @ui.duplicateButton': 'click:duplicate',
		'click @ui.itemTitle': 'click:edit'
	},

	modelEvents: {
		change: 'onModelChange'
	},

	templateHelpers: function() {
		return {
			itemIndex: this.getOption( 'itemIndex' )
		};
	},

	childViewContainer: '.elementor-repeater-row-controls',

	getChildView: function( item ) {
		var controlType = item.get( 'type' );

		return elementor.getControlView( controlType );
	},

	childViewOptions: function() {
		return {
			elementSettingsModel: this.model
		};
	},

	updateIndex: function( newIndex ) {
		this.itemIndex = newIndex;
	},

	setTitle: function() {
		var titleField = this.getOption( 'titleField' ),
			title = '';

		if ( titleField ) {
			var values = {};

			this.children.each( function( child ) {
				if ( ! ( child instanceof ControlBaseDataView ) ) {
					return;
				}

				values[ child.model.get( 'name' ) ] = child.getControlValue();
			} );

			title = Marionette.TemplateCache.prototype.compileTemplate( titleField )( this.model.parseDynamicSettings() );
		}

		if ( ! title ) {
			title = elementor.translate( 'Item #{0}', [ this.getOption( 'itemIndex' ) ] );
		}

		this.ui.itemTitle.html( title );
	},

	initialize: function( options ) {
		this.itemIndex = 0;

		// Collection for Controls list
		this.collection = new Backbone.Collection( _.values( elementor.mergeControlsSettings( options.controlFields ) ) );
	},

	onRender: function() {
		this.setTitle();
	},

	onModelChange: function() {
		if ( this.getOption( 'titleField' ) ) {
			this.setTitle();
		}
	},

	onChildviewResponsiveSwitcherClick: function( childView, device ) {
		if ( 'desktop' === device ) {
			elementor.getPanelView().getCurrentPageView().$el.toggleClass( 'elementor-responsive-switchers-open' );
		}
	}
} );

module.exports = RepeaterRowView;
