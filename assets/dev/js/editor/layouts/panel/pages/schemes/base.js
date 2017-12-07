var childViewTypes = {
		color: require( 'elementor-panel/pages/schemes/items/color' ),
		typography: require( 'elementor-panel/pages/schemes/items/typography' )
	},
	PanelSchemeBaseView;

PanelSchemeBaseView = Marionette.CompositeView.extend( {
	id: function() {
		return 'elementor-panel-scheme-' + this.getType();
	},

	className: function() {
		return 'elementor-panel-scheme elementor-panel-scheme-' + this.getUIType();
	},

	childViewContainer: '.elementor-panel-scheme-items',

	getTemplate: function() {
		return Marionette.TemplateCache.get( '#tmpl-elementor-panel-schemes-' + this.getType() );
	},

	getChildView: function() {
		return childViewTypes[ this.getUIType() ];
	},

	getUIType: function() {
		return this.getType();
	},

	ui: function() {
		return {
			saveButton: '.elementor-panel-scheme-save .elementor-button',
			discardButton: '.elementor-panel-scheme-discard .elementor-button',
			resetButton: '.elementor-panel-scheme-reset .elementor-button'
		};
	},

	events: function() {
		return {
			'click @ui.saveButton': 'saveScheme',
			'click @ui.discardButton': 'discardScheme',
			'click @ui.resetButton': 'setDefaultScheme'
		};
	},

	initialize: function() {
		this.model = new Backbone.Model();

		this.resetScheme();
	},

	getType: function() {},

	getScheme: function() {
		return elementor.schemes.getScheme( this.getType() );
	},

	changeChildrenUIValues: function( schemeItems ) {
		var self = this;

		_.each( schemeItems, function( value, key ) {
			var model = self.collection.findWhere( { key: key } ),
				childView = self.children.findByModelCid( model.cid );

			childView.changeUIValue( value );
		} );
	},

	discardScheme: function() {
		elementor.schemes.resetSchemes( this.getType() );

		this.onSchemeChange();

		this.ui.saveButton.prop( 'disabled', true );

		this._renderChildren();
	},

	setSchemeValue: function( key, value ) {
		elementor.schemes.setSchemeValue( this.getType(), key, value );

		this.onSchemeChange();
	},

	saveScheme: function() {
		elementor.schemes.saveScheme( this.getType() );

		this.ui.saveButton.prop( 'disabled', true );

		this.resetScheme();

		this._renderChildren();
	},

	setDefaultScheme: function() {
		var defaultScheme = elementor.config.default_schemes[ this.getType() ].items;

		this.changeChildrenUIValues( defaultScheme );
	},

	resetItems: function() {
		this.model.set( 'items', this.getScheme().items );
	},

	resetCollection: function() {
		var self = this,
			items = self.model.get( 'items' );

		self.collection = new Backbone.Collection();

		_.each( items, function( item, key ) {
			item.type = self.getType();
			item.key = key;

			self.collection.add( item );
		} );
	},

	resetScheme: function() {
		this.resetItems();
		this.resetCollection();
	},

	onSchemeChange: function() {
		elementor.schemes.printSchemesStyle();
	},

	onChildviewValueChange: function( childView, newValue ) {
		this.ui.saveButton.removeProp( 'disabled' );

		this.setSchemeValue( childView.model.get( 'key' ), newValue );
	}
} );

module.exports = PanelSchemeBaseView;
