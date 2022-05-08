var childViewTypes = {
		color: require( 'elementor-panel/pages/schemes/items/color' ),
		typography: require( 'elementor-panel/pages/schemes/items/typography' ),
	},
	PanelSchemeBaseView;

PanelSchemeBaseView = Marionette.CompositeView.extend( {
	id() {
		return 'elementor-panel-scheme-' + this.getType();
	},

	className() {
		return 'elementor-panel-scheme elementor-panel-scheme-' + this.getUIType();
	},

	childViewContainer: '.elementor-panel-scheme-items',

	getTemplate() {
		return Marionette.TemplateCache.get( '#tmpl-elementor-panel-schemes-' + this.getType() );
	},

	getChildView() {
		return childViewTypes[ this.getUIType() ];
	},

	getUIType() {
		return this.getType();
	},

	ui() {
		return {
			saveButton: '.elementor-panel-scheme-save .elementor-button',
			discardButton: '.elementor-panel-scheme-discard .elementor-button',
			resetButton: '.elementor-panel-scheme-reset .elementor-button',
		};
	},

	events() {
		return {
			'click @ui.saveButton': 'saveScheme',
			'click @ui.discardButton': 'discardScheme',
			'click @ui.resetButton': 'setDefaultScheme',
		};
	},

	initialize() {
		this.model = new Backbone.Model();

		this.resetScheme();
	},

	getType() {},

	getScheme() {
		return elementor.schemes.getScheme( this.getType() );
	},

	changeChildrenUIValues( schemeItems ) {
		var self = this;

		_.each( schemeItems, function( value, key ) {
			const model = self.collection.findWhere( { key } ),
				childView = self.children.findByModelCid( model.cid );

			childView.changeUIValue( value );
		} );
	},

	discardScheme() {
		elementor.schemes.resetSchemes( this.getType() );

		this.onSchemeChange();

		this.ui.saveButton.prop( 'disabled', true );

		this._renderChildren();
	},

	setSchemeValue( key, value ) {
		elementor.schemes.setSchemeValue( this.getType(), key, value );

		this.onSchemeChange();
	},

	saveScheme() {
		NProgress.start();

		elementor.schemes.saveScheme( this.getType() ).done( NProgress.done );

		this.ui.saveButton.prop( 'disabled', true );

		this.resetScheme();

		this._renderChildren();
	},

	setDefaultScheme() {
		var defaultScheme = elementor.config.default_schemes[ this.getType() ].items;

		this.changeChildrenUIValues( defaultScheme );
	},

	resetItems() {
		this.model.set( 'items', this.getScheme().items );
	},

	resetCollection() {
		var self = this,
			items = self.model.get( 'items' );

		self.collection = new Backbone.Collection();

		_.each( items, function( item, key ) {
			item.type = self.getType();
			item.key = key;

			self.collection.add( item );
		} );
	},

	resetScheme() {
		this.resetItems();
		this.resetCollection();
	},

	onSchemeChange() {
		elementor.schemes.printSchemesStyle();
	},

	onChildviewValueChange( childView, newValue ) {
		this.ui.saveButton.removeProp( 'disabled' );

		this.setSchemeValue( childView.model.get( 'key' ), newValue );
	},
} );

module.exports = PanelSchemeBaseView;
